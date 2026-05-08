import { useState, useEffect } from 'react';
import { useSharedState } from '../../hooks/useSharedState';

const HEX_CODES = ['1C', '55', 'E9', 'FF', 'BD', '7A', '2B'];
const GRID_SIZE = 8;
const TARGET_SEQUENCE = ['E9', '55', 'FF', '1C', 'BD', '7A'];
const BUFFER_SIZE = 8;

export function BreachProtocol({ onSuccess, onFail }: { onSuccess: () => void, onFail: () => void }) {
  const [matrix, setMatrix] = useSharedState<string[][]>('r3_bp_matrix', []);
  const [buffer, setBuffer] = useSharedState<string[]>('r3_bp_buffer', []);
  const [activeAxis, setActiveAxis] = useSharedState<'row' | 'col'>('r3_bp_axis', 'row');
  const [activeIndex, setActiveIndex] = useSharedState<number>('r3_bp_index', 0);
  const [selectedCoords, setSelectedCoords] = useSharedState<{r: number, c: number}[]>('r3_bp_coords', []);

  useEffect(() => {
    // Generate Matrix only once for the team
    if (matrix.length > 0) return;
    let m = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0).map(() => HEX_CODES[Math.floor(Math.random() * HEX_CODES.length)]));
    // Ensure target sequence is possible (force a path)
    let c = Math.floor(Math.random() * GRID_SIZE);
    let r = 0;
    m[r][c] = TARGET_SEQUENCE[0];
    
    let pathR = r; let pathC = c;
    for(let i=1; i<TARGET_SEQUENCE.length; i++) {
        if(i % 2 === 1) { // col move (same col, diff row)
            let newR = Math.floor(Math.random() * GRID_SIZE);
            while(newR === pathR) newR = Math.floor(Math.random() * GRID_SIZE);
            pathR = newR;
        } else { // row move (same row, diff col)
            let newC = Math.floor(Math.random() * GRID_SIZE);
            while(newC === pathC) newC = Math.floor(Math.random() * GRID_SIZE);
            pathC = newC;
        }
        m[pathR][pathC] = TARGET_SEQUENCE[i];
    }
    setMatrix(m);
  }, []);

  useEffect(() => {
    // Check if buffer contains target sequence
    if (buffer.length > 0) {
      const bufferStr = buffer.join(',');
      const targetStr = TARGET_SEQUENCE.join(',');
      if (bufferStr.includes(targetStr)) {
        onSuccess();
      } else if (buffer.length >= BUFFER_SIZE) {
        setBuffer([]);
        setSelectedCoords([]);
        setActiveAxis("row");
        setActiveIndex(0);
        onFail();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffer]);

  const handleSelect = (r: number, c: number) => {
    // Validate move
    if (selectedCoords.some(coord => coord.r === r && coord.c === c)) return; // Already selected
    if (activeAxis === 'row' && r !== activeIndex) return;
    if (activeAxis === 'col' && c !== activeIndex) return;

    setBuffer([...buffer, matrix[r][c]]);
    setSelectedCoords([...selectedCoords, {r, c}]);
    
    if (activeAxis === 'row') {
      setActiveAxis('col');
      setActiveIndex(c);
    } else {
      setActiveAxis('row');
      setActiveIndex(r);
    }
  };

  return (
    <div className="flex gap-8 bg-[#0a0a0c] border border-red-500/30 p-8 font-mono text-white selection:none">
      {/* Matrix side */}
      <div className="flex-1">
        <h3 className="text-red-500 font-bold mb-4 tracking-widest uppercase">Breach Protocol // Override</h3>
        <div className="grid grid-cols-8 gap-2 w-fit">
          {matrix.map((row, r) => (
            row.map((hex, c) => {
              const isSelected = selectedCoords.some(coord => coord.r === r && coord.c === c);
              const isActive = !isSelected && ((activeAxis === 'row' && r === activeIndex) || (activeAxis === 'col' && c === activeIndex));
              
              return (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => isActive && handleSelect(r, c)}
                  className={`w-12 h-12 flex items-center justify-center font-bold text-lg border-2 transition-all cursor-pointer ${
                    isSelected ? 'bg-red-500/20 text-red-500 border-red-500 opacity-50' :
                    isActive ? 'bg-red-900/30 text-white border-red-500/50 hover:bg-red-500 hover:border-red-400' :
                    'border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  {hex}
                </div>
              );
            })
          ))}
        </div>
      </div>

      {/* Target & Buffer side */}
      <div className="w-64 flex flex-col justify-between">
        <div>
          <h4 className="text-muted text-sm mb-2 uppercase tracking-widest">Sequence Required</h4>
          <div className="flex gap-2 flex-wrap">
            {TARGET_SEQUENCE.map((hex, i) => (
              <div key={i} className="w-10 h-10 border border-gold/50 flex items-center justify-center text-gold font-bold bg-gold/10">
                {hex}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-muted text-sm mb-2 uppercase tracking-widest mt-8">Buffer Memory [{buffer.length}/{BUFFER_SIZE}]</h4>
          <div className="flex gap-2 flex-wrap">
            {Array(BUFFER_SIZE).fill(0).map((_, i) => (
              <div key={i} className="w-10 h-10 border border-border flex items-center justify-center text-white bg-black">
                {buffer[i] || ''}
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
