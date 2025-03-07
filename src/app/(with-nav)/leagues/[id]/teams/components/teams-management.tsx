import { Manager } from '../types/manager';

// Sections Components
import { TSMHeader } from './tsm-components/tsm-header';
import { TSMContent } from './tsm-components/tsm-content';

interface TeamsManagementProps {
    managers: Manager[];
}

export function TeamsManagement({ managers }: TeamsManagementProps) {
    return (
      <div className="border-b border-border">
        <TSMHeader />
        <TSMContent managers={managers} />
      </div>
    );
  }