import { useTranslation } from '@/i18n/useTranslation';
import type { SheetLayout } from '@/utils/bin-packing';

const PIECE_COLORS = [
  '#a43700',
  '#186a22',
  '#8f7066',
  '#5f5e5e',
  '#8B5E3C',
  '#4A7C6F',
];

interface SheetVisualizationProps {
  sheets: SheetLayout[];
}

function SheetCard({ sheet, index }: { sheet: SheetLayout; index: number }) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">
        {t('units.sheet')} {sheet.id}
      </p>
      <svg
        viewBox="0 0 2440 1220"
        className="w-full border-2 border-outline-variant rounded"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={0}
          y={0}
          width={2440}
          height={1220}
          className="fill-surface-container"
        />
        {sheet.pieces.map((piece, pieceIdx) => {
          const color = PIECE_COLORS[pieceIdx % PIECE_COLORS.length];
          const centerX = piece.x + piece.width / 2;
          const centerY = piece.y + piece.height / 2;
          const fontSize = Math.min(piece.width / 8, piece.height / 3, 40);
          const dimFontSize = fontSize * 0.7;

          return (
            <g key={`${index}-${pieceIdx}`}>
              <rect
                x={piece.x}
                y={piece.y}
                width={piece.width}
                height={piece.height}
                fill={color}
                fillOpacity={0.25}
                stroke={color}
                strokeWidth={3}
              />
              {piece.width > 60 && piece.height > 40 && (
                <>
                  <text
                    x={centerX}
                    y={centerY - dimFontSize * 0.4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fontWeight="bold"
                    fill={color}
                  >
                    {piece.partName}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + fontSize * 0.6}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={dimFontSize}
                    fill={color}
                    opacity={0.8}
                  >
                    {piece.width}x{piece.height}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SheetVisualization({ sheets }: SheetVisualizationProps) {
  if (sheets.length === 0) return null;

  return (
    <div className="space-y-6">
      {sheets.map((sheet, index) => (
        <SheetCard key={sheet.id} sheet={sheet} index={index} />
      ))}
    </div>
  );
}
