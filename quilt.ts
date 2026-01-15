// Types
interface Pattern {
    type:
        | "solid"
        | "horizontal"
        | "vertical"
        | "diagonal"
        | "checkerboard"
        | "quartersquare"
        | "ninepatch"
        | "pinwheel"
        | "flyinggeese";
    colors: string[];
    rotation?: number;
}

interface GridConfig {
    rows: number;
    cols: number;
}

interface QuiltData {
    patterns: Pattern[];
    library: Pattern[];
    gridConfig?: GridConfig; // Optional for backwards compatibility
    savedAt: string;
}

// State
let squareSize: number = 50;
let rows: number = 8;
let cols: number = 6;
let patterns: Pattern[] = [];
let draggedIndex: number | null = null;
let library: Pattern[] = [];
let draggedLibraryPattern: number | null = null;
let dragGhost: HTMLElement | null = null;
let lastTapTime: number = 0;
let lastTapIndex: number = -1;
let gridConfig: GridConfig = {
    rows: 6,
    cols: 8,
};

// Create drag ghost element
function createDragGhost(sourceElement: HTMLElement, touch: Touch): void {
    dragGhost = sourceElement.cloneNode(true) as HTMLElement;
    dragGhost.classList.add("drag-ghost");
    dragGhost.style.width = sourceElement.offsetWidth + "px";
    dragGhost.style.height = sourceElement.offsetHeight + "px";
    dragGhost.style.left = touch.clientX + "px";
    dragGhost.style.top = touch.clientY + "px";

    // Preserve the rotation from the source element
    const computedTransform = window.getComputedStyle(sourceElement).transform;
    if (computedTransform && computedTransform !== "none") {
        dragGhost.style.transform =
            computedTransform + " translate(-50%, -50%)";
    }

    document.body.appendChild(dragGhost);
}

// Update drag ghost position
function updateDragGhost(touch: Touch): void {
    if (dragGhost) {
        dragGhost.style.left = touch.clientX + "px";
        dragGhost.style.top = touch.clientY + "px";
    }
}

// Remove drag ghost
function removeDragGhost(): void {
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
}

// Rotate a pattern 90 degrees clockwise
function rotatePattern(index: number): void {
    if (!patterns[index].rotation) {
        patterns[index].rotation = 0;
    }
    patterns[index].rotation = (patterns[index].rotation! + 90) % 360;

    // Re-render the quilt to apply rotation
    renderQuilt();
}

// Calculate optimal square size based on viewport
function calculateSquareSize(): number {
    const isPortrait = window.innerHeight > window.innerWidth;
    // Use actual rows/cols instead of hardcoded values
    const numCols = cols;
    const numRows = rows;

    let availableHeight: number, availableWidth: number;

    if (isPortrait) {
        // In portrait, controls are above quilt
        const controlHeight = 200;
        availableHeight = window.innerHeight - controlHeight;
        availableWidth = window.innerWidth - 40;
    } else {
        // In landscape, controls are beside quilt
        const controlWidth = 320; // 300px wrapper + gaps
        availableHeight = window.innerHeight - 30;
        availableWidth = window.innerWidth - controlWidth - 40;
    }

    // Calculate size based on rows and columns
    const sizeByHeight = Math.floor((availableHeight - 20) / numRows);
    const sizeByWidth = Math.floor((availableWidth - 20) / numCols);

    // Use the smaller of the two to ensure it fits
    return Math.max(30, Math.min(sizeByHeight, sizeByWidth, 100));
}

// Generate random pastel colors
function getRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 30);
    const lightness = 60 + Math.floor(Math.random() * 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Create a random pattern
function createRandomPattern(): Pattern {
    const types: Pattern["type"][] = [
        "solid",
        "horizontal",
        "vertical",
        "diagonal",
        "checkerboard",
        "quartersquare",
        "ninepatch",
        "pinwheel",
        "flyinggeese",
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === "solid") {
        return { type: "solid", colors: [getRandomColor()], rotation: 0 };
    } else if (
        type === "horizontal" ||
        type === "vertical" ||
        type === "diagonal"
    ) {
        // Generate 5 random colors for stripes
        const stripeColors: string[] = [];
        for (let i = 0; i < 5; i++) {
            stripeColors.push(getRandomColor());
        }
        return { type: type, colors: stripeColors, rotation: 0 };
    } else if (type === "checkerboard") {
        // Generate 2 colors for checkerboard
        return {
            type: "checkerboard",
            colors: [getRandomColor(), getRandomColor()],
            rotation: 0,
        };
    } else if (type === "quartersquare") {
        // Generate 4 colors for quarter-square triangles
        return {
            type: "quartersquare",
            colors: [
                getRandomColor(),
                getRandomColor(),
                getRandomColor(),
                getRandomColor(),
            ],
            rotation: 0,
        };
    } else if (type === "ninepatch") {
        // Generate 3 colors for nine patch
        return {
            type: "ninepatch",
            colors: [getRandomColor(), getRandomColor(), getRandomColor()],
            rotation: 0,
        };
    } else if (type === "pinwheel") {
        // Generate 2 colors for pinwheel
        return {
            type: "pinwheel",
            colors: [getRandomColor(), getRandomColor()],
            rotation: 0,
        };
    } else if (type === "flyinggeese") {
        // Generate 3 colors for flying geese (2 geese + background)
        return {
            type: "flyinggeese",
            colors: [getRandomColor(), getRandomColor(), getRandomColor()],
            rotation: 0,
        };
    }
    // Default fallback
    return { type: "solid", colors: [getRandomColor()], rotation: 0 };
}

// Initialize pattern array
function initializeColors(): void {
    patterns = [];
    const totalSquares = rows * cols;
    for (let i = 0; i < totalSquares; i++) {
        patterns.push(createRandomPattern());
    }
}

// Render a pattern as CSS background
function getPatternStyle(pattern: Pattern): string {
    if (pattern.type === "solid") {
        return pattern.colors[0];
    } else if (pattern.type === "horizontal") {
        // Create horizontal stripes
        const stripeHeight = 100 / 5; // 5 stripes
        const gradientStops: string[] = [];
        for (let i = 0; i < 5; i++) {
            const start = i * stripeHeight;
            const end = (i + 1) * stripeHeight;
            gradientStops.push(`${pattern.colors[i]} ${start}%`);
            gradientStops.push(`${pattern.colors[i]} ${end}%`);
        }
        return `linear-gradient(to bottom, ${gradientStops.join(", ")})`;
    } else if (pattern.type === "vertical") {
        // Create vertical stripes
        const stripeWidth = 100 / 5; // 5 stripes
        const gradientStops: string[] = [];
        for (let i = 0; i < 5; i++) {
            const start = i * stripeWidth;
            const end = (i + 1) * stripeWidth;
            gradientStops.push(`${pattern.colors[i]} ${start}%`);
            gradientStops.push(`${pattern.colors[i]} ${end}%`);
        }
        return `linear-gradient(to right, ${gradientStops.join(", ")})`;
    } else if (pattern.type === "diagonal") {
        // Create diagonal stripes (45 degrees)
        const stripeWidth = 100 / 5;
        const gradientStops: string[] = [];
        for (let i = 0; i < 5; i++) {
            const start = i * stripeWidth;
            const end = (i + 1) * stripeWidth;
            gradientStops.push(`${pattern.colors[i]} ${start}%`);
            gradientStops.push(`${pattern.colors[i]} ${end}%`);
        }
        return `linear-gradient(45deg, ${gradientStops.join(", ")})`;
    } else if (pattern.type === "checkerboard") {
        // Create checkerboard pattern with 4x4 grid using SVG
        const c1 = pattern.colors[0].replace("#", "%23");
        const c2 = pattern.colors[1].replace("#", "%23");
        let rects = "";
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const color = (row + col) % 2 === 0 ? c1 : c2;
                rects += `<rect x='${col * 25}' y='${
                    row * 25
                }' width='25' height='25' fill='${color}'/>`;
            }
        }
        return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${rects}</svg>")`;
    } else if (pattern.type === "quartersquare") {
        // Create quarter-square triangles using SVG
        const c0 = pattern.colors[0].replace("#", "%23");
        const c1 = pattern.colors[1].replace("#", "%23");
        const c2 = pattern.colors[2].replace("#", "%23");
        const c3 = pattern.colors[3].replace("#", "%23");
        return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='0,0 100,0 50,50' fill='${c0}'/><polygon points='100,0 100,100 50,50' fill='${c1}'/><polygon points='100,100 0,100 50,50' fill='${c2}'/><polygon points='0,100 0,0 50,50' fill='${c3}'/></svg>")`;
    } else if (pattern.type === "ninepatch") {
        // Create nine-patch pattern (3x3 grid)
        const colors = pattern.colors.map(c => c.replace("#", "%23"));
        let rects = "";
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const colorIndex = (row * 3 + col) % colors.length;
                rects += `<rect x='${col * 33.33}' y='${row * 33.33}' width='33.34' height='33.34' fill='${colors[colorIndex]}'/>`;
            }
        }
        return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${rects}</svg>")`;
    } else if (pattern.type === "pinwheel") {
        // Create pinwheel pattern (8 triangles all pointing to center, alternating colors)
        const c0 = pattern.colors[0].replace("#", "%23");
        const c1 = pattern.colors[1].replace("#", "%23");
        // 8 triangles: center to each corner and center to each edge midpoint
        return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,50 0,0 50,0' fill='${c0}'/><polygon points='50,50 50,0 100,0' fill='${c1}'/><polygon points='50,50 100,0 100,50' fill='${c0}'/><polygon points='50,50 100,50 100,100' fill='${c1}'/><polygon points='50,50 100,100 50,100' fill='${c0}'/><polygon points='50,50 50,100 0,100' fill='${c1}'/><polygon points='50,50 0,100 0,50' fill='${c0}'/><polygon points='50,50 0,50 0,0' fill='${c1}'/></svg>")`;
    } else if (pattern.type === "flyinggeese") {
        // Create flying geese pattern (left goose + right goose both pointing right, 4 background triangles)
        const c0 = pattern.colors[0].replace("#", "%23"); // Left goose
        const c1 = pattern.colors[1].replace("#", "%23"); // Right goose
        const c2 = pattern.colors[2].replace("#", "%23"); // Background
        // Left goose points right from left edge to middle, right goose points right from middle to right edge
        return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='0,0 0,100 50,50' fill='${c0}'/><polygon points='50,0 50,100 100,50' fill='${c1}'/><polygon points='0,0 50,0 50,50' fill='${c2}'/><polygon points='50,0 100,0 100,50' fill='${c2}'/><polygon points='0,100 50,100 50,50' fill='${c2}'/><polygon points='50,100 100,100 100,50' fill='${c2}'/></svg>")`;
    }
    return "";
}

// Update color pickers based on pattern type
function updateColorPickers(): void {
    const typeSelect = document.getElementById(
        "designerPatternType"
    ) as HTMLSelectElement;
    const type = typeSelect.value as Pattern["type"];
    const picker = document.getElementById("colorStripePicker")!;
    picker.innerHTML = "";

    let numColors = 1;
    let defaultColors = ["#ff6b9d"];

    if (type === "solid") {
        numColors = 1;
        defaultColors = ["#ff6b9d"];
    } else if (
        type === "horizontal" ||
        type === "vertical" ||
        type === "diagonal"
    ) {
        numColors = 5;
        defaultColors = ["#ff6b9d", "#764ba2", "#667eea", "#f093fb", "#4facfe"];
    } else if (type === "checkerboard") {
        numColors = 2;
        defaultColors = ["#ff6b9d", "#667eea"];
    } else if (type === "quartersquare") {
        numColors = 4;
        defaultColors = ["#ff6b9d", "#764ba2", "#667eea", "#f093fb"];
    } else if (type === "ninepatch") {
        numColors = 3;
        defaultColors = ["#ff6b9d", "#667eea", "#f093fb"];
    } else if (type === "pinwheel") {
        numColors = 2;
        defaultColors = ["#ff6b9d", "#667eea"];
    } else if (type === "flyinggeese") {
        numColors = 3;
        defaultColors = ["#ff6b9d", "#667eea", "#f093fb"];
    }

    for (let i = 0; i < numColors; i++) {
        const input = document.createElement("input");
        input.type = "color";
        input.value = defaultColors[i];
        picker.appendChild(input);
    }
}

// Add pattern to library
function addPatternToLibrary(): void {
    const typeSelect = document.getElementById(
        "designerPatternType"
    ) as HTMLSelectElement;
    const type = typeSelect.value as Pattern["type"];
    const colorInputs = document.querySelectorAll(
        '#colorStripePicker input[type="color"]'
    ) as NodeListOf<HTMLInputElement>;
    const colors = Array.from(colorInputs).map((input) => input.value);

    const pattern: Pattern = { type: type, colors: colors, rotation: 0 };
    library.push(pattern);
    renderLibrary();
}

// Render the pattern library
function renderLibrary(): void {
    const container = document.getElementById("libraryItems")!;
    container.innerHTML = "";

    if (library.length === 0) {
        container.innerHTML =
            '<p style="color: #999; font-style: italic;">No patterns yet. Design one above to get started!</p>';
        return;
    }

    library.forEach((pattern, index) => {
        const item = document.createElement("div");
        item.className = "library-item";
        item.draggable = true;

        // Apply pattern style
        const patternStyle = getPatternStyle(pattern);
        if (pattern.type === "solid") {
            item.style.backgroundColor = patternStyle;
            item.style.backgroundImage = "none";
        } else {
            item.style.backgroundImage = patternStyle;
            item.style.backgroundColor = "transparent";
            item.style.backgroundRepeat = "no-repeat";
        }

        // Drag events
        item.addEventListener("dragstart", () => {
            draggedLibraryPattern = index;
            item.classList.add("dragging");
        });

        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            draggedLibraryPattern = null;
        });

        // Touch events for mobile
        item.addEventListener("touchstart", (e) => {
            draggedLibraryPattern = index;
            draggedIndex = null;
            item.classList.add("dragging");
            createDragGhost(item, e.touches[0]);
            e.stopPropagation();
        });

        item.addEventListener("touchmove", (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            updateDragGhost(touch);
            const elementBelow = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );

            // Remove drag-over from all squares
            document
                .querySelectorAll(".quilt-square.drag-over")
                .forEach((sq) => {
                    sq.classList.remove("drag-over");
                });

            // Add drag-over to current square
            if (
                elementBelow &&
                elementBelow.classList.contains("quilt-square")
            ) {
                elementBelow.classList.add("drag-over");
            }
        });

        item.addEventListener("touchend", (e) => {
            e.preventDefault();
            item.classList.remove("dragging");
            removeDragGhost();

            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );

            // Remove drag-over from all squares
            document
                .querySelectorAll(".quilt-square.drag-over")
                .forEach((sq) => {
                    sq.classList.remove("drag-over");
                });

            if (
                elementBelow &&
                elementBelow.classList.contains("quilt-square")
            ) {
                const quilt = document.getElementById("quilt")!;
                const targetSquareIndex = Array.from(quilt.children).indexOf(
                    elementBelow
                );

                if (targetSquareIndex !== -1) {
                    // Copy pattern from library
                    patterns[targetSquareIndex] = JSON.parse(
                        JSON.stringify(library[index])
                    );

                    // Update visual
                    const newPattern = patterns[targetSquareIndex];
                    const newStyle = getPatternStyle(newPattern);
                    const target = elementBelow as HTMLElement;
                    if (newPattern.type === "solid") {
                        target.style.backgroundColor = newStyle;
                        target.style.backgroundImage = "none";
                    } else {
                        target.style.backgroundImage = newStyle;
                        target.style.backgroundColor = "transparent";
                        target.style.backgroundRepeat = "no-repeat";
                    }
                    target.style.transform = `rotate(${
                        newPattern.rotation || 0
                    }deg)`;
                }
            }

            draggedLibraryPattern = null;
        });

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "×";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            library.splice(index, 1);
            renderLibrary();
        };

        item.appendChild(deleteBtn);
        container.appendChild(item);
    });
}

// Export quilt as PNG
function exportQuiltAsPNG(): void {
    // Use current grid dimensions
    const numCols = cols;
    const numRows = rows;

    // Create canvas with appropriate size (use fixed square size for export)
    const exportSquareSize = 100; // Higher resolution for export
    const canvas = document.createElement("canvas");
    canvas.width = numCols * exportSquareSize;
    canvas.height = numRows * exportSquareSize;
    const ctx = canvas.getContext("2d")!;

    // Draw each square
    for (let i = 0; i < numRows * numCols; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        const x = col * exportSquareSize;
        const y = row * exportSquareSize;

        // Get the correct pattern index (use landscape conversion when in landscape)
        const currentIsPortrait = window.innerHeight > window.innerWidth;
        const patternIndex = !currentIsPortrait ? landscapeToPortrait(i) : i;
        const pattern = patterns[patternIndex];
        const rotation = pattern.rotation || 0;

        // Apply rotation if needed
        ctx.save();
        if (rotation !== 0) {
            ctx.translate(x + exportSquareSize / 2, y + exportSquareSize / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-exportSquareSize / 2, -exportSquareSize / 2);
        } else {
            ctx.translate(x, y);
        }

        if (pattern.type === "solid") {
            ctx.fillStyle = pattern.colors[0];
            ctx.fillRect(0, 0, exportSquareSize, exportSquareSize);
            ctx.restore();
        } else if (pattern.type === "horizontal") {
            // Draw horizontal stripes
            const stripeHeight = exportSquareSize / 5;
            for (let j = 0; j < 5; j++) {
                ctx.fillStyle = pattern.colors[j];
                ctx.fillRect(
                    0,
                    j * stripeHeight,
                    exportSquareSize,
                    stripeHeight
                );
            }
            ctx.restore();
        } else if (pattern.type === "vertical") {
            // Draw vertical stripes
            const stripeWidth = exportSquareSize / 5;
            for (let j = 0; j < 5; j++) {
                ctx.fillStyle = pattern.colors[j];
                ctx.fillRect(j * stripeWidth, 0, stripeWidth, exportSquareSize);
            }
            ctx.restore();
        } else if (pattern.type === "diagonal") {
            // Draw diagonal stripes with clipping
            // Set clipping region to the square
            ctx.beginPath();
            ctx.rect(0, 0, exportSquareSize, exportSquareSize);
            ctx.clip();
            // Rotate and draw stripes
            ctx.translate(exportSquareSize / 2, exportSquareSize / 2);
            ctx.rotate((-45 * Math.PI) / 180); // CSS 45deg from north = canvas -45deg from east
            const diagonal = exportSquareSize * Math.sqrt(2);
            const stripeWidth = diagonal / 5;
            for (let j = 0; j < 5; j++) {
                ctx.fillStyle = pattern.colors[j];
                ctx.fillRect(
                    -diagonal / 2 + j * stripeWidth,
                    -diagonal / 2,
                    stripeWidth,
                    diagonal
                );
            }
            ctx.restore();
        } else if (pattern.type === "checkerboard") {
            // Draw checkerboard pattern (4x4 grid)
            const checkSize = exportSquareSize / 4;
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const colorIndex = (row + col) % 2;
                    ctx.fillStyle = pattern.colors[colorIndex];
                    ctx.fillRect(
                        col * checkSize,
                        row * checkSize,
                        checkSize,
                        checkSize
                    );
                }
            }
            ctx.restore();
        } else if (pattern.type === "quartersquare") {
            // Draw quarter-square triangles
            const cx = exportSquareSize / 2;
            const cy = exportSquareSize / 2;

            // Top-left triangle
            ctx.fillStyle = pattern.colors[0];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(exportSquareSize, 0);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();

            // Top-right triangle
            ctx.fillStyle = pattern.colors[1];
            ctx.beginPath();
            ctx.moveTo(exportSquareSize, 0);
            ctx.lineTo(exportSquareSize, exportSquareSize);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();

            // Bottom-right triangle
            ctx.fillStyle = pattern.colors[2];
            ctx.beginPath();
            ctx.moveTo(exportSquareSize, exportSquareSize);
            ctx.lineTo(0, exportSquareSize);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();

            // Bottom-left triangle
            ctx.fillStyle = pattern.colors[3];
            ctx.beginPath();
            ctx.moveTo(0, exportSquareSize);
            ctx.lineTo(0, 0);
            ctx.lineTo(cx, cy);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (pattern.type === "ninepatch") {
            // Draw nine-patch pattern (3x3 grid)
            const patchSize = exportSquareSize / 3;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const colorIndex = (row * 3 + col) % pattern.colors.length;
                    ctx.fillStyle = pattern.colors[colorIndex];
                    ctx.fillRect(col * patchSize, row * patchSize, patchSize, patchSize);
                }
            }
            ctx.restore();
        } else if (pattern.type === "pinwheel") {
            // Draw pinwheel pattern (8 triangles all pointing to center, alternating colors)
            const cx = exportSquareSize / 2;
            const cy = exportSquareSize / 2;

            // Triangle 1: center to top-left corner and top edge midpoint
            ctx.fillStyle = pattern.colors[0];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(0, 0);
            ctx.lineTo(cx, 0);
            ctx.closePath();
            ctx.fill();

            // Triangle 2: center to top edge midpoint and top-right corner
            ctx.fillStyle = pattern.colors[1];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, 0);
            ctx.lineTo(exportSquareSize, 0);
            ctx.closePath();
            ctx.fill();

            // Triangle 3: center to top-right corner and right edge midpoint
            ctx.fillStyle = pattern.colors[0];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(exportSquareSize, 0);
            ctx.lineTo(exportSquareSize, cy);
            ctx.closePath();
            ctx.fill();

            // Triangle 4: center to right edge midpoint and bottom-right corner
            ctx.fillStyle = pattern.colors[1];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(exportSquareSize, cy);
            ctx.lineTo(exportSquareSize, exportSquareSize);
            ctx.closePath();
            ctx.fill();

            // Triangle 5: center to bottom-right corner and bottom edge midpoint
            ctx.fillStyle = pattern.colors[0];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(exportSquareSize, exportSquareSize);
            ctx.lineTo(cx, exportSquareSize);
            ctx.closePath();
            ctx.fill();

            // Triangle 6: center to bottom edge midpoint and bottom-left corner
            ctx.fillStyle = pattern.colors[1];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx, exportSquareSize);
            ctx.lineTo(0, exportSquareSize);
            ctx.closePath();
            ctx.fill();

            // Triangle 7: center to bottom-left corner and left edge midpoint
            ctx.fillStyle = pattern.colors[0];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(0, exportSquareSize);
            ctx.lineTo(0, cy);
            ctx.closePath();
            ctx.fill();

            // Triangle 8: center to left edge midpoint and top-left corner
            ctx.fillStyle = pattern.colors[1];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(0, cy);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else if (pattern.type === "flyinggeese") {
            // Draw flying geese pattern (left goose + right goose both pointing right, 4 background triangles)
            const halfX = exportSquareSize / 2;
            const halfY = exportSquareSize / 2;

            // Left goose triangle (pointing right to middle)
            ctx.fillStyle = pattern.colors[0];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, exportSquareSize);
            ctx.lineTo(halfX, halfY);
            ctx.closePath();
            ctx.fill();

            // Right goose triangle (pointing right from middle)
            ctx.fillStyle = pattern.colors[1];
            ctx.beginPath();
            ctx.moveTo(halfX, 0);
            ctx.lineTo(halfX, exportSquareSize);
            ctx.lineTo(exportSquareSize, halfY);
            ctx.closePath();
            ctx.fill();

            // Top-left background triangle
            ctx.fillStyle = pattern.colors[2];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(halfX, 0);
            ctx.lineTo(halfX, halfY);
            ctx.closePath();
            ctx.fill();

            // Top-right background triangle
            ctx.fillStyle = pattern.colors[2];
            ctx.beginPath();
            ctx.moveTo(halfX, 0);
            ctx.lineTo(exportSquareSize, 0);
            ctx.lineTo(halfX, halfY);
            ctx.closePath();
            ctx.fill();

            // Bottom-left background triangle
            ctx.fillStyle = pattern.colors[2];
            ctx.beginPath();
            ctx.moveTo(0, exportSquareSize);
            ctx.lineTo(halfX, exportSquareSize);
            ctx.lineTo(halfX, halfY);
            ctx.closePath();
            ctx.fill();

            // Bottom-right background triangle
            ctx.fillStyle = pattern.colors[2];
            ctx.beginPath();
            ctx.moveTo(halfX, exportSquareSize);
            ctx.lineTo(exportSquareSize, exportSquareSize);
            ctx.lineTo(halfX, halfY);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    // Convert canvas to PNG and download
    canvas.toBlob((blob) => {
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `quilt-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
}

// Save quilt to JSON file
function saveQuilt(): void {
    const quiltData: QuiltData = {
        patterns: patterns,
        library: library,
        gridConfig: gridConfig,
        savedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(quiltData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quilt-design-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load quilt from JSON file
function loadQuilt(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const quiltData = JSON.parse(
                e.target?.result as string
            ) as QuiltData;

            // Restore patterns
            if (quiltData.patterns) {
                patterns = quiltData.patterns;
                renderQuilt();
            }

            // Restore library
            if (quiltData.library) {
                library = quiltData.library;
                renderLibrary();
            }

            // Restore grid config
            if (quiltData.gridConfig) {
                gridConfig = quiltData.gridConfig;
                rows = gridConfig.rows;
                cols = gridConfig.cols;
            }

            alert("Quilt loaded successfully!");
        } catch (error) {
            alert("Error loading quilt: " + (error as Error).message);
        }

        // Reset file input
        input.value = "";
    };
    reader.readAsText(file);
}

// Map landscape index to portrait index (rotate 90 degrees clockwise)
function landscapeToPortrait(landscapeIndex: number): number {
    // Get current dimensions
    const landscapeCols = gridConfig.rows; // In landscape, cols = portrait rows
    const landscapeRows = gridConfig.cols; // In landscape, rows = portrait cols

    const row = Math.floor(landscapeIndex / landscapeCols);
    const col = landscapeIndex % landscapeCols;

    // Map to portrait (90 degree clockwise rotation)
    const portraitRow = col;
    const portraitCol = landscapeRows - 1 - row;
    return portraitRow * gridConfig.cols + portraitCol;
}

// Update grid dimensions from config, swapping to maximize screen usage
function updateOrientation(): void {
    const isPortrait = window.innerHeight > window.innerWidth;
    const configIsWiderThanTall = gridConfig.cols > gridConfig.rows;

    // If portrait screen and config is wider, OR landscape screen and config is taller, swap them
    if ((isPortrait && configIsWiderThanTall) || (!isPortrait && !configIsWiderThanTall)) {
        // Swap to match screen orientation
        rows = gridConfig.cols;
        cols = gridConfig.rows;
    } else {
        // Use as-is
        rows = gridConfig.rows;
        cols = gridConfig.cols;
    }
}

// Apply pattern style to element
function applyPatternToElement(element: HTMLElement, pattern: Pattern): void {
    const patternStyle = getPatternStyle(pattern);
    if (pattern.type === "solid") {
        element.style.backgroundColor = patternStyle;
        element.style.backgroundImage = "none";
    } else {
        element.style.backgroundImage = patternStyle;
        element.style.backgroundColor = "transparent";
        element.style.backgroundRepeat = "no-repeat";
    }
    element.style.transform = `rotate(${pattern.rotation || 0}deg)`;
}

// Render the quilt
function renderQuilt(): void {
    const quilt = document.getElementById("quilt")!;
    quilt.innerHTML = "";

    updateOrientation();

    // Set CSS grid columns dynamically
    quilt.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // Calculate optimal square size
    squareSize = calculateSquareSize();

    const isPortrait = window.innerHeight > window.innerWidth;
    const expectedPatternCount = rows * cols;

    // Ensure we have patterns initialized
    if (patterns.length !== expectedPatternCount) {
        initializeColors();
    }

    for (let i = 0; i < rows * cols; i++) {
        const square = document.createElement("div");
        square.className = "quilt-square";

        // Get the correct pattern index based on orientation
        let patternIndex = i;
        if (!isPortrait) {
            // In landscape, use rotation mapping
            patternIndex = landscapeToPortrait(i);
        }
        const pattern = patterns[patternIndex];

        // Apply pattern style
        applyPatternToElement(square, pattern);

        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.draggable = true;

        // Drag start - remember which square is being dragged
        square.addEventListener("dragstart", (e) => {
            draggedIndex = i;
            square.classList.add("dragging");

            // Set custom drag image to preserve rotation on desktop
            if (e.dataTransfer) {
                // Use canvas to create a rotated drag image
                const canvas = document.createElement("canvas");
                const size = square.offsetWidth;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d")!;

                // Get the pattern and rotation
                const patternIndex = isPortrait ? i : landscapeToPortrait(i);
                const pattern = patterns[patternIndex];
                const rotation = pattern.rotation || 0;

                // Apply rotation
                ctx.save();
                ctx.translate(size / 2, size / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.translate(-size / 2, -size / 2);

                // Draw the pattern
                if (pattern.type === "solid") {
                    ctx.fillStyle = pattern.colors[0];
                    ctx.fillRect(0, 0, size, size);
                } else if (
                    pattern.type === "horizontal" ||
                    pattern.type === "vertical" ||
                    pattern.type === "diagonal"
                ) {
                    // Draw stripes
                    const stripeSize = size / 5;
                    for (let j = 0; j < 5; j++) {
                        ctx.fillStyle = pattern.colors[j];
                        if (pattern.type === "horizontal") {
                            ctx.fillRect(0, j * stripeSize, size, stripeSize);
                        } else if (pattern.type === "vertical") {
                            ctx.fillRect(j * stripeSize, 0, stripeSize, size);
                        } else if (pattern.type === "diagonal") {
                            // For diagonal, create the stripes at 45 degrees
                            ctx.save();
                            ctx.translate(size / 2, size / 2);
                            ctx.rotate((-45 * Math.PI) / 180);
                            const diagonal = size * Math.sqrt(2);
                            const diagStripeSize = diagonal / 5;
                            ctx.fillRect(
                                -diagonal / 2 + j * diagStripeSize,
                                -diagonal / 2,
                                diagStripeSize,
                                diagonal
                            );
                            ctx.restore();
                        }
                    }
                } else if (pattern.type === "checkerboard") {
                    const checkSize = size / 4;
                    for (let row = 0; row < 4; row++) {
                        for (let col = 0; col < 4; col++) {
                            ctx.fillStyle = pattern.colors[(row + col) % 2];
                            ctx.fillRect(
                                col * checkSize,
                                row * checkSize,
                                checkSize,
                                checkSize
                            );
                        }
                    }
                } else if (pattern.type === "quartersquare") {
                    const cx = size / 2;
                    const cy = size / 2;

                    // Top triangle
                    ctx.fillStyle = pattern.colors[0];
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(size, 0);
                    ctx.lineTo(cx, cy);
                    ctx.closePath();
                    ctx.fill();

                    // Right triangle
                    ctx.fillStyle = pattern.colors[1];
                    ctx.beginPath();
                    ctx.moveTo(size, 0);
                    ctx.lineTo(size, size);
                    ctx.lineTo(cx, cy);
                    ctx.closePath();
                    ctx.fill();

                    // Bottom triangle
                    ctx.fillStyle = pattern.colors[2];
                    ctx.beginPath();
                    ctx.moveTo(size, size);
                    ctx.lineTo(0, size);
                    ctx.lineTo(cx, cy);
                    ctx.closePath();
                    ctx.fill();

                    // Left triangle
                    ctx.fillStyle = pattern.colors[3];
                    ctx.beginPath();
                    ctx.moveTo(0, size);
                    ctx.lineTo(0, 0);
                    ctx.lineTo(cx, cy);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();

                // Convert canvas to image for better browser compatibility
                const img = new Image();
                img.src = canvas.toDataURL();
                img.style.position = "absolute";
                img.style.top = "-9999px";
                document.body.appendChild(img);

                // Set image as drag image (more reliable than canvas)
                e.dataTransfer.setDragImage(img, size / 2, size / 2);

                // Clean up image after drag starts
                setTimeout(() => img.remove(), 0);
            }
        });

        // Drag end - clean up
        square.addEventListener("dragend", (e) => {
            square.classList.remove("dragging");
            draggedIndex = null;
        });

        // Double-click to rotate
        square.addEventListener("dblclick", (e) => {
            e.preventDefault();
            rotatePattern(i);
        });

        // Drag over - allow dropping
        square.addEventListener("dragover", (e) => {
            e.preventDefault();
            square.classList.add("drag-over");
        });

        // Drag leave - remove visual feedback
        square.addEventListener("dragleave", (e) => {
            square.classList.remove("drag-over");
        });

        // Drop - copy pattern from source to target
        square.addEventListener("drop", (e) => {
            e.preventDefault();
            square.classList.remove("drag-over");

            const targetPatternIndex = isPortrait ? i : landscapeToPortrait(i);

            // Check if dropping from library
            if (draggedLibraryPattern !== null) {
                // Copy pattern from library
                patterns[targetPatternIndex] = JSON.parse(
                    JSON.stringify(library[draggedLibraryPattern])
                );
                applyPatternToElement(square, patterns[targetPatternIndex]);
            } else if (draggedIndex !== null && draggedIndex !== i) {
                // Copy pattern from another quilt square
                const sourcePatternIndex = isPortrait
                    ? draggedIndex
                    : landscapeToPortrait(draggedIndex);
                patterns[targetPatternIndex] = JSON.parse(
                    JSON.stringify(patterns[sourcePatternIndex])
                );
                applyPatternToElement(square, patterns[targetPatternIndex]);
            }
        });

        // Touch support for mobile
        square.addEventListener("touchstart", (e) => {
            const currentTime = new Date().getTime();
            const tapInterval = currentTime - lastTapTime;

            // Check for double-tap (within 300ms on same square)
            if (tapInterval < 300 && tapInterval > 0 && lastTapIndex === i) {
                e.preventDefault();
                rotatePattern(i);
                lastTapTime = 0;
                lastTapIndex = -1;
                return;
            }

            lastTapTime = currentTime;
            lastTapIndex = i;

            // Start drag immediately (double-tap is detected above)
            draggedIndex = i;
            square.classList.add("dragging");
            createDragGhost(square, e.touches[0]);
            e.preventDefault();
        });

        square.addEventListener("touchmove", (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            updateDragGhost(touch);
            const elementBelow = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );

            // Remove drag-over from all squares
            document
                .querySelectorAll(".quilt-square.drag-over")
                .forEach((sq) => {
                    sq.classList.remove("drag-over");
                });

            // Add drag-over to current square
            if (
                elementBelow &&
                elementBelow.classList.contains("quilt-square")
            ) {
                elementBelow.classList.add("drag-over");
            }
        });

        square.addEventListener("touchend", (e) => {
            e.preventDefault();
            square.classList.remove("dragging");
            removeDragGhost();

            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );

            // Remove drag-over from all squares
            document
                .querySelectorAll(".quilt-square.drag-over")
                .forEach((sq) => {
                    sq.classList.remove("drag-over");
                });

            if (
                elementBelow &&
                elementBelow.classList.contains("quilt-square")
            ) {
                const targetSquareIndex = Array.from(quilt.children).indexOf(
                    elementBelow
                );

                if (
                    draggedIndex !== null &&
                    targetSquareIndex !== -1 &&
                    draggedIndex !== targetSquareIndex
                ) {
                    const targetPatternIndex = isPortrait
                        ? targetSquareIndex
                        : landscapeToPortrait(targetSquareIndex);

                    // Check if dropping from library
                    if (draggedLibraryPattern !== null) {
                        patterns[targetPatternIndex] = JSON.parse(
                            JSON.stringify(library[draggedLibraryPattern])
                        );
                    } else {
                        // Copy pattern from another quilt square
                        const sourcePatternIndex = isPortrait
                            ? draggedIndex
                            : landscapeToPortrait(draggedIndex);
                        patterns[targetPatternIndex] = JSON.parse(
                            JSON.stringify(patterns[sourcePatternIndex])
                        );
                    }

                    // Update visual
                    applyPatternToElement(
                        elementBelow as HTMLElement,
                        patterns[targetPatternIndex]
                    );
                }
            }

            draggedIndex = null;
            draggedLibraryPattern = null;
        });

        quilt.appendChild(square);
    }
}

// Handle orientation changes
window.addEventListener("resize", renderQuilt);
window.addEventListener("orientationchange", renderQuilt);

// Grid Settings Modal Functions
function openGridSettings(): void {
    const modal = document.getElementById("gridSettingsModal")!;
    modal.classList.add("active");

    // Set active buttons
    updateColumnsButtons();
    updateRowsButtons();
    updateGridResult();
}

function closeGridSettings(): void {
    const modal = document.getElementById("gridSettingsModal")!;
    modal.classList.remove("active");
}

function setColumns(count: number): void {
    gridConfig.cols = count;
    updateColumnsButtons();
    updateGridResult();
}

function setRows(count: number): void {
    gridConfig.rows = count;
    updateRowsButtons();
    updateGridResult();
}

function updateColumnsButtons(): void {
    const unitsSection = document.getElementById("gridUnitsSection");
    if (!unitsSection) return;

    const buttons = unitsSection.querySelectorAll(".units-buttons")[0].querySelectorAll(".unit-btn");
    buttons.forEach((btn) => {
        const buttonCount = parseInt(
            (btn as HTMLElement).textContent || "4"
        );
        if (buttonCount === gridConfig.cols) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function updateRowsButtons(): void {
    const unitsSection = document.getElementById("gridUnitsSection");
    if (!unitsSection) return;

    const buttons = unitsSection.querySelectorAll(".units-buttons")[1].querySelectorAll(".unit-btn");
    buttons.forEach((btn) => {
        const buttonCount = parseInt(
            (btn as HTMLElement).textContent || "4"
        );
        if (buttonCount === gridConfig.rows) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

function updateGridResult(): void {
    const resultDiv = document.getElementById("gridResult");
    if (!resultDiv) return;

    const totalSquares = gridConfig.cols * gridConfig.rows;

    resultDiv.innerHTML = `<p>Grid: <strong>${gridConfig.cols} columns × ${gridConfig.rows} rows (${totalSquares} squares)</strong></p>`;
}

function applyGridSettings(): void {
    // Reinitialize patterns for the new grid size
    initializeColors();
    renderQuilt();
    closeGridSettings();
}

// Make functions available globally for HTML onclick handlers
(window as any).updateColorPickers = updateColorPickers;
(window as any).addPatternToLibrary = addPatternToLibrary;
(window as any).exportQuiltAsPNG = exportQuiltAsPNG;
(window as any).saveQuilt = saveQuilt;
(window as any).loadQuilt = loadQuilt;
(window as any).openGridSettings = openGridSettings;
(window as any).closeGridSettings = closeGridSettings;
(window as any).setColumns = setColumns;
(window as any).setRows = setRows;
(window as any).applyGridSettings = applyGridSettings;

// Initial render
initializeColors();
renderQuilt();
updateColorPickers();
renderLibrary();
