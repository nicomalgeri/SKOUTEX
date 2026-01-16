"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { FOOTBALL_POSITIONS, POSITION_GROUPS, type Position } from "@/lib/club/positions";

interface PositionSelectorProps {
  value: string[];
  onChange: (positions: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  className?: string;
}

export function PositionSelector({
  value = [],
  onChange,
  maxSelections = 5,
  placeholder = "Select positions...",
  className = "",
}: PositionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePosition = (position: string) => {
    if (value.includes(position)) {
      onChange(value.filter((p) => p !== position));
    } else {
      if (value.length < maxSelections) {
        onChange([...value, position]);
      }
    }
  };

  const removePosition = (position: string) => {
    onChange(value.filter((p) => p !== position));
  };

  const getPositionLabel = (positionValue: string) => {
    const pos = FOOTBALL_POSITIONS.find((p) => p.value === positionValue);
    return pos?.label || positionValue;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected positions pills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((position) => (
            <span
              key={position}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0031FF] text-white text-xs font-medium"
            >
              {position}
              <button
                type="button"
                onClick={() => removePosition(position)}
                className="hover:bg-white/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#f6f6f6] border border-gray-200 rounded-xl text-[#2C2C2C] focus:outline-none focus:border-[#0031FF] flex items-center justify-between text-left"
      >
        <span className={value.length === 0 ? "text-gray-500" : ""}>
          {value.length === 0
            ? placeholder
            : `${value.length} position${value.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Selection limit indicator */}
      {value.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {value.length} / {maxSelections} positions selected
        </p>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {Object.entries(POSITION_GROUPS).map(([groupName, positions]) => (
            <div key={groupName} className="border-b border-gray-100 last:border-b-0">
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {groupName}
              </div>
              <div className="py-1">
                {positions.map((position) => {
                  const isSelected = value.includes(position.value);
                  const isDisabled = !isSelected && value.length >= maxSelections;

                  return (
                    <button
                      key={position.value}
                      type="button"
                      onClick={() => !isDisabled && togglePosition(position.value)}
                      disabled={isDisabled}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 text-[#0031FF] font-medium"
                          : isDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>
                        <span className="font-semibold mr-2">{position.value}</span>
                        <span className="text-xs text-gray-500">{position.label}</span>
                      </span>
                      {isSelected && (
                        <span className="text-[#0031FF] text-xs font-semibold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
