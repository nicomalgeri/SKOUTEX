"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  ExternalLink,
  Flag,
} from "lucide-react";
import {
  TransferTarget,
  getTargetPriorityInfo,
  getTargetStatusInfo,
  TARGET_STATUSES,
  TARGET_PRIORITIES,
  UpdateTargetInput,
} from "@/lib/targets/types";
import { formatCurrency } from "@/lib/utils";

interface TargetCardProps {
  target: TransferTarget;
  onUpdate: (id: string, input: UpdateTargetInput) => Promise<TransferTarget | void>;
  onDelete: (id: string) => Promise<void>;
}

export function TargetCard({ target, onUpdate, onDelete }: TargetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<UpdateTargetInput>({
    priority: target.priority,
    status: target.status,
    target_price_eur: target.target_price_eur || undefined,
    max_price_eur: target.max_price_eur || undefined,
    notes: target.notes || undefined,
  });

  const priorityInfo = getTargetPriorityInfo(target.priority);
  const statusInfo = getTargetStatusInfo(target.status);

  const handleSave = async () => {
    try {
      await onUpdate(target.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update target:", error);
      alert("Failed to update target");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${target.player_name} from transfer targets?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(target.id);
    } catch (error) {
      console.error("Failed to delete target:", error);
      alert("Failed to delete target");
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {target.player_name}
            </h3>
            <p className="text-sm text-gray-500">
              {target.position} • {target.current_club}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0031FF]"
              >
                {TARGET_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0031FF]"
              >
                {TARGET_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Price (€)
              </label>
              <input
                type="number"
                value={formData.target_price_eur || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_price_eur: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="5000000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0031FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (€)
              </label>
              <input
                type="number"
                value={formData.max_price_eur || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_price_eur: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="7000000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0031FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Scouting notes, observations..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0031FF]"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0031FF] text-white rounded-lg hover:bg-[#0028DD] transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {target.player_name}
            </h3>
            <Link
              href={`/dashboard/players/${target.player_id}`}
              className="text-[#0031FF] hover:text-[#0028DD]"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {target.position && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {target.position}
              </span>
            )}
            {target.age && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {target.age} years
              </span>
            )}
            {target.nationality && (
              <span className="flex items-center gap-1">
                <Flag className="w-4 h-4" />
                {target.nationality}
              </span>
            )}
          </div>

          {target.current_club && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {target.current_club}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-[#0031FF] transition-colors"
            title="Edit target"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete target"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${priorityInfo.color}`}
        >
          {priorityInfo.label}
        </span>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Financial Info */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        {target.market_value_eur && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Market Value</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(target.market_value_eur)}
            </p>
          </div>
        )}
        {target.target_price_eur && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Target Price</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(target.target_price_eur)}
            </p>
          </div>
        )}
        {target.max_price_eur && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Max Price</p>
            <p className="text-sm font-semibold text-red-600">
              {formatCurrency(target.max_price_eur)}
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      {target.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-700 line-clamp-2">{target.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          Added {new Date(target.created_at).toLocaleDateString()}
        </span>
        <span>
          Updated {new Date(target.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
