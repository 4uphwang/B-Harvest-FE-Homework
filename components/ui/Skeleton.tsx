// components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
    height?: string;
    width?: string;
    className?: string;
}

const SkeletonElement: React.FC<SkeletonProps> = ({ height = 'h-4', width = 'w-full', className = '' }) => (
    <div className={`bg-surfaces-on-surface/20 rounded ${height} ${width} ${className}`}></div>
);

export const SkeletonCard: React.FC = () => (
    <div className="bg-surfaces-on-surface/[6%] p-2 rounded-xl border border-darker animate-pulse h-14">
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-surfaces-on-surface/20"></div>
            <div className="flex flex-col items-start justify-center gap-y-1 flex-1">
                <SkeletonElement width="w-1/2" height="h-4" />
                <SkeletonElement width="w-1/3" height="h-3" />
            </div>
            <SkeletonElement width="w-12" height="h-5" />
        </div>
    </div>
);

export const SkeletonSummaryCard: React.FC = () => (
    <div className="bg-surfaces-base-2 p-4 rounded-xl shadow-lg animate-pulse h-20 flex justify-between items-center">
        <div className="space-y-2">
            <SkeletonElement width="w-20" height="h-3" className="bg-surfaces-on-surface/30" />
            <SkeletonElement width="w-32" height="h-7" className="bg-surfaces-on-surface/20" />
        </div>
        <div className="space-y-2">
            <SkeletonElement width="w-20" height="h-3" className="bg-surfaces-on-surface/30" />
            <SkeletonElement width="w-24" height="h-7" className="bg-surfaces-on-surface/20" />
        </div>
    </div>
);
