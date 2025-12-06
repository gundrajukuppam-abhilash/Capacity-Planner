
import React from 'react';
import { TeamMember, DayInfo, LeaveDay, CapacityOverride, Holiday } from '../types';
import { Calendar, ChevronLeft, ChevronRight, X, MapPin, Download } from 'lucide-react';

interface LeaveGridProps {
  members: TeamMember[];
  days: DayInfo[];
  leaves: LeaveDay[];
  overrides: CapacityOverride[];
  holidays: Holiday[];
  onToggleLeave: (memberId: string, date: string) => void;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
  onCapacityUpdate: (memberId: string, date: string, hours: number) => void;
  capacityData: Record<string, number>;
  isManager: boolean;
  viewStartDate: string;
  viewEndDate: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDateSelect: (date: string) => void;
  onEndDateSelect: (date: string) => void;
}

const LeaveGrid: React.FC<LeaveGridProps> = ({ 
  members, 
  days, 
  leaves, 
  overrides,
  holidays,
  onToggleLeave,
  onUpdateMember,
  onCapacityUpdate,
  capacityData,
  isManager,
  viewStartDate,
  viewEndDate,
  onNavigate,
  onDateSelect,
  onEndDateSelect
}) => {
  
  const getLeaveStatus = (memberId: string, date: string) => {
    return leaves.find(l => l.memberId === memberId && l.date === date);
  };

  const getOverride = (memberId: string, date: string) => {
    return overrides.find(o => o.memberId === memberId && o.date === date);
  };

  const getHoliday = (memberLocation: string, date: string) => {
     // Safe check for location
     const loc = (memberLocation || '').toLowerCase();
     return holidays.find(h => 
        date >= h.startDate && date <= h.endDate &&
        (h.locations.includes('All') || h.locations.map(l => l.toLowerCase()).includes(loc))
     );
  };

  // Helper to format YYYY-MM-DD to MM/DD/YYYY for display without timezone issues
  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '-';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  };

  const handleExportCSV = () => {
    // 1. Metadata Rows
    const rows = [
      ['Capacity Plan Export'],
      ['Start Date', viewStartDate, 'End Date', viewEndDate],
      [] // Empty row
    ];

    // 2. Header Row
    const headers = ['Team Member', 'Role', 'Location', 'Base Daily Cap'];
    days.forEach(day => headers.push(day.displayDate));
    headers.push('Total Capacity');
    rows.push(headers);

    // 3. Data Rows
    members.forEach(member => {
      const row: (string | number)[] = [
        member.name,
        member.role,
        member.location || 'Remote',
        member.dailyCapacityHours
      ];

      days.forEach(day => {
        // Pre-check Start Date
        if (member.startDate && day.date < member.startDate) {
          row.push(0);
          return;
        }

        if (day.isWeekend) {
          row.push(0);
          return;
        }

        const leave = getLeaveStatus(member.id, day.date);
        const override = getOverride(member.id, day.date);
        const holiday = getHoliday(member.location, day.date);

        // Replicate logic from utils.calculateCapacity for consistency
        let dailyHours = holiday ? 0 : member.dailyCapacityHours;

        if (override) {
          dailyHours = override.hours;
        }

        if (leave && leave.status === 'approved') {
           if (leave.type === 'Full') {
             dailyHours = 0;
           } else if (leave.type === 'Half') {
             const baseForCalc = override ? override.hours : (holiday ? 0 : member.dailyCapacityHours);
             dailyHours = baseForCalc / 2;
           }
        }
        
        row.push(dailyHours);
      });

      row.push(capacityData[member.id] || 0);
      rows.push(row);
    });

    // 4. Construct CSV String
    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    // 5. Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `capacity_plan_${viewStartDate}_to_${viewEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 min-w-fit">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Capacity Plan {isManager ? '(Manager)' : '(View)'}
          </h3>
          
          <div className="flex items-center bg-white rounded-lg p-1 gap-2 shadow-sm border border-gray-200 max-w-full overflow-x-auto">
            <button 
              onClick={() => onNavigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors shrink-0"
              title="Previous Period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 px-2">
               <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase leading-none mb-1">Start Date</label>
                  <div className="relative group">
                    <div className="flex items-center justify-between text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 bg-white shadow-sm w-[140px] cursor-pointer hover:border-indigo-500 transition-colors">
                      <span className="font-medium">{formatDateDisplay(viewStartDate)}</span>
                      <Calendar className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                    <input 
                      type="date" 
                      value={viewStartDate}
                      onChange={(e) => onDateSelect(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
               </div>
               <span className="text-gray-300 font-light text-2xl mt-4 hidden sm:inline">/</span>
               <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase leading-none mb-1">End Date</label>
                  <div className="relative group">
                    <div className="flex items-center justify-between text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 bg-white shadow-sm w-[140px] cursor-pointer hover:border-indigo-500 transition-colors">
                      <span className="font-medium">{formatDateDisplay(viewEndDate)}</span>
                      <Calendar className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                    <input 
                      type="date" 
                      value={viewEndDate}
                      onChange={(e) => onEndDateSelect(e.target.value)}
                      min={viewStartDate}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
               </div>
            </div>

            <button 
              onClick={() => onNavigate('next')}
              className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors shrink-0"
              title="Next Period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm h-fit"
            title="Export View to CSV"
          >
             <Download className="w-4 h-4" />
             <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 items-center justify-start lg:justify-end">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div> Full Leave</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></div> Half Leave</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-50 border border-purple-300 rounded"></div> Holiday</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-50 border border-blue-300 border-dashed rounded"></div> Pending</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-gray-300 rounded"></div> Capacity</div>
        </div>
      </div>

      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 border-b border-r border-gray-200 min-w-[200px] sticky left-0 z-10 shadow-sm">
                Team Member
              </th>
              <th className="p-4 bg-gray-50 border-b border-gray-200 text-center min-w-[100px]">
                Daily Cap
              </th>
              {days.map((day) => (
                <th key={day.date} className={`p-2 border-b border-gray-200 text-center min-w-[50px] ${day.isWeekend ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}>
                  <div className="font-semibold">{day.dayName}</div>
                  <div className="text-[10px] font-normal text-gray-500 whitespace-nowrap">{day.displayDate}</div>
                </th>
              ))}
              <th className="p-4 bg-gray-50 border-b border-l border-gray-200 text-center min-w-[140px] sticky right-0 z-10 shadow-sm">
                Member Capacity
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 border-b border-r border-gray-200 bg-white sticky left-0 z-10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                       {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                          {member.role}
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center text-gray-400">
                             <MapPin className="w-2.5 h-2.5 mr-0.5" /> {member?.location || 'Remote'}
                          </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 border-b border-gray-100 text-center bg-white">
                  <div className="flex items-center justify-center gap-1">
                    {isManager ? (
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        className="w-14 text-center border border-gray-300 rounded-md text-sm py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={member.dailyCapacityHours}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                             onUpdateMember(member.id, { dailyCapacityHours: val });
                          } else if (e.target.value === '') {
                             onUpdateMember(member.id, { dailyCapacityHours: 0 });
                          }
                        }}
                      />
                    ) : (
                      <span className="w-14 text-center border border-transparent text-sm py-1 text-gray-700">
                        {member.dailyCapacityHours}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">h</span>
                  </div>
                </td>
                {days.map((day) => {
                  const isWeekend = day.isWeekend;
                  const isBeforeStart = member.startDate && day.date < member.startDate;
                  
                  // Pre-Check: Member hasn't started yet
                  if (isBeforeStart) {
                     return (
                        <td key={`${member.id}-${day.date}`} className="border-b border-gray-100 text-center p-1 bg-gray-50">
                           <span className="text-xs text-gray-300">-</span>
                        </td>
                     );
                  }

                  const leave = getLeaveStatus(member.id, day.date);
                  const override = getOverride(member.id, day.date);
                  const holiday = getHoliday(member.location, day.date);
                  
                  // Base value logic
                  let displayValue = override ? override.hours : member.dailyCapacityHours;
                  let cellClass = 'bg-white';
                  let isDisabled = false;
                  
                  // Holiday Logic (Priority over base, under leave)
                  if (holiday) {
                      cellClass = 'bg-purple-50 text-purple-700 font-medium';
                      displayValue = 0;
                      isDisabled = true;
                  }

                  // Pending leave styling
                  if (leave && leave.status === 'pending') {
                    cellClass = 'bg-blue-50 border-blue-200 border-dashed border';
                    displayValue = member.dailyCapacityHours; // Pending doesnt reduce yet
                  }

                  // Approved leave logic (deducts capacity)
                  if (leave && leave.status === 'approved') {
                    isDisabled = true;
                    if (leave.type === 'Full') {
                      displayValue = 0;
                      cellClass = 'bg-red-50 text-red-700';
                    } else if (leave.type === 'Half') {
                      // Recalculate base in case it was a holiday
                      const base = override ? override.hours : (holiday ? 0 : member.dailyCapacityHours);
                      displayValue = base / 2;
                      cellClass = 'bg-amber-50 text-amber-800';
                    }
                  }

                  // Override check (Overrides holiday value if set explicitly)
                  if (override) {
                      displayValue = override.hours;
                      // Keep holiday color if it is a holiday but overridden? 
                      // Maybe neutral since it's now working capacity
                      if (holiday && displayValue > 0) {
                          cellClass = 'bg-purple-50/50 text-gray-900 border-purple-200'; 
                      }
                  }

                  if (isWeekend) {
                    cellClass = 'bg-gray-100 text-gray-400';
                    isDisabled = true;
                    displayValue = 0;
                  }

                  return (
                    <td 
                      key={`${member.id}-${day.date}`} 
                      className={`border-b border-gray-100 text-center p-1 relative group ${cellClass}`}
                      title={holiday ? `${holiday.name} (Holiday)` : ''}
                      onContextMenu={(e) => {
                        // Manager shortcut to toggle leave
                        if (isManager && !isWeekend && !holiday) {
                          e.preventDefault();
                          onToggleLeave(member.id, day.date);
                        }
                      }}
                    >
                      {!isWeekend ? (
                        <div className="relative flex items-center justify-center w-full h-full min-h-[28px]">
                           <input
                            type="number"
                            min="0"
                            max="24"
                            disabled={isDisabled || !isManager}
                            className={`w-full h-full text-center text-xs py-1 bg-transparent outline-none focus:ring-1 focus:ring-indigo-500 rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                ${isDisabled ? 'cursor-not-allowed font-medium' : 'cursor-text hover:bg-gray-50 font-normal text-gray-700'}`}
                            value={displayValue}
                            onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                    onCapacityUpdate(member.id, day.date, val);
                                }
                            }}
                          />
                          {/* Quick Remove for Approved Leaves */}
                          {isManager && leave && leave.status === 'approved' && (
                             <button
                               onClick={() => onToggleLeave(member.id, day.date)}
                               className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-sm border border-gray-200 text-gray-400 hover:text-red-500 hidden group-hover:flex items-center justify-center z-20"
                               title="Remove Leave"
                             >
                               <X className="w-3 h-3" />
                             </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="p-3 border-b border-l border-gray-200 bg-white sticky right-0 z-10 text-center shadow-sm">
                  <span className="text-sm font-bold text-indigo-600">
                    {capacityData[member.id]}h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveGrid;
