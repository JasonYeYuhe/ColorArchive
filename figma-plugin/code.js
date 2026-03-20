// ColorArchive Figma Plugin — Main thread
figma.showUI(__html__, { width: 340, height: 520, themeColors: true });

figma.ui.onmessage = (msg) => {
  if (msg.type === "apply-fill") {
    const hex = msg.hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Select a layer first, then apply a color.");
      return;
    }

    for (const node of selection) {
      if ("fills" in node) {
        node.fills = [{ type: "SOLID", color: { r, g, b } }];
      }
    }
    figma.notify(`Applied ${msg.name} (${hex})`);
  }

  if (msg.type === "create-swatch") {
    const hex = msg.hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const rect = figma.createRectangle();
    rect.name = `${msg.name} ${hex}`;
    rect.resize(120, 120);
    rect.cornerRadius = 16;
    rect.fills = [{ type: "SOLID", color: { r, g, b } }];

    // Position near viewport center
    const viewport = figma.viewport.center;
    rect.x = viewport.x - 60;
    rect.y = viewport.y - 60;

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);
    figma.notify(`Created swatch: ${msg.name}`);
  }

  if (msg.type === "create-style") {
    const hex = msg.hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const style = figma.createPaintStyle();
    style.name = `ColorArchive/${msg.family}/${msg.name}`;
    style.paints = [{ type: "SOLID", color: { r, g, b } }];
    figma.notify(`Created local style: ${style.name}`);
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};
