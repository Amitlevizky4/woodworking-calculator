import type { WoodPart } from '@/types';

const SHEET_WIDTH = 2440;
const SHEET_HEIGHT = 1220;
const KERF = 3;

export interface PlacedPiece {
  partName: string;
  partId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SheetLayout {
  id: number;
  pieces: PlacedPiece[];
}

interface BinPackingResult {
  sheets: SheetLayout[];
  totalSheets: number;
  wastePercent: number;
  placements: PlacedPiece[];
}

interface Shelf {
  yOffset: number;
  shelfHeight: number;
  remainingWidth: number;
}

interface ExpandedPiece {
  partName: string;
  partId: string;
  width: number;
  height: number;
}

function expandParts(parts: WoodPart[]): ExpandedPiece[] {
  const expanded: ExpandedPiece[] = [];

  for (const part of parts) {
    for (let i = 0; i < part.quantity; i++) {
      expanded.push({
        partName: part.name,
        partId: part.id,
        width: part.lengthMm,
        height: part.widthMm,
      });
    }
  }

  return expanded;
}

export function packSheets(parts: WoodPart[]): BinPackingResult {
  const pieces = expandParts(parts);

  pieces.sort((a, b) => b.height - a.height);

  const sheets: SheetLayout[] = [];
  const sheetShelves: Shelf[][] = [];
  const allPlacements: PlacedPiece[] = [];

  for (const piece of pieces) {
    let isPlaced = false;

    for (let sheetIdx = 0; sheetIdx < sheets.length; sheetIdx++) {
      const shelves = sheetShelves[sheetIdx];

      for (const shelf of shelves) {
        if (
          piece.width + KERF <= shelf.remainingWidth &&
          piece.height <= shelf.shelfHeight
        ) {
          const x = SHEET_WIDTH - shelf.remainingWidth;
          const y = shelf.yOffset;

          const placement: PlacedPiece = {
            partName: piece.partName,
            partId: piece.partId,
            x,
            y,
            width: piece.width,
            height: piece.height,
          };

          sheets[sheetIdx].pieces.push(placement);
          allPlacements.push(placement);
          shelf.remainingWidth -= piece.width + KERF;
          isPlaced = true;
          break;
        }
      }

      if (isPlaced) break;

      const usedHeight = shelves.reduce(
        (sum, s) => sum + s.shelfHeight + KERF,
        0,
      );
      const availableHeight = SHEET_HEIGHT - usedHeight;

      if (piece.height <= availableHeight && piece.width <= SHEET_WIDTH) {
        const newShelf: Shelf = {
          yOffset: usedHeight,
          shelfHeight: piece.height,
          remainingWidth: SHEET_WIDTH - piece.width - KERF,
        };

        shelves.push(newShelf);

        const placement: PlacedPiece = {
          partName: piece.partName,
          partId: piece.partId,
          x: 0,
          y: usedHeight,
          width: piece.width,
          height: piece.height,
        };

        sheets[sheetIdx].pieces.push(placement);
        allPlacements.push(placement);
        isPlaced = true;
        break;
      }
    }

    if (!isPlaced) {
      const sheetId = sheets.length + 1;
      const newSheet: SheetLayout = { id: sheetId, pieces: [] };
      const newShelf: Shelf = {
        yOffset: 0,
        shelfHeight: piece.height,
        remainingWidth: SHEET_WIDTH - piece.width - KERF,
      };

      const placement: PlacedPiece = {
        partName: piece.partName,
        partId: piece.partId,
        x: 0,
        y: 0,
        width: piece.width,
        height: piece.height,
      };

      newSheet.pieces.push(placement);
      allPlacements.push(placement);
      sheets.push(newSheet);
      sheetShelves.push([newShelf]);
    }
  }

  const totalSheetArea = sheets.length * SHEET_WIDTH * SHEET_HEIGHT;
  const usedArea = allPlacements.reduce(
    (sum, p) => sum + p.width * p.height,
    0,
  );
  const wastePercent =
    totalSheetArea > 0
      ? ((totalSheetArea - usedArea) / totalSheetArea) * 100
      : 0;

  return {
    sheets,
    totalSheets: sheets.length,
    wastePercent: Math.round(wastePercent * 100) / 100,
    placements: allPlacements,
  };
}
