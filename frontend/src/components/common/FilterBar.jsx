import { RotateCcw } from 'lucide-react';
import { Button } from './Button';

export function FilterBar({ children, onReset, showReset = false, className = '' }) {
  return (
    <div className={`filter-toolbar ${className}`}>
      <div className="filter-group-left">{children}</div>
      {showReset && onReset && (
        <div className="filter-group-right">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
