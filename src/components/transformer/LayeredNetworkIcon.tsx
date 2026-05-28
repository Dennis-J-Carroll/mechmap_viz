// src/components/transformer/LayeredNetworkIcon.tsx
interface LayeredNetworkIconProps {
  className?: string;
}

export function LayeredNetworkIcon({ className }: LayeredNetworkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      {/* Input layer */}
      <circle cx={3} cy={8} r={1.8} fill="currentColor" fillOpacity={0.15} stroke="none" />
      <circle cx={3} cy={16} r={1.8} fill="currentColor" fillOpacity={0.15} stroke="none" />
      {/* Hidden layer */}
      <circle cx={12} cy={5} r={1.8} fill="currentColor" fillOpacity={0.1} stroke="none" />
      <circle cx={12} cy={12} r={1.8} fill="currentColor" fillOpacity={0.25} stroke="none" />
      <circle cx={12} cy={19} r={1.8} fill="currentColor" fillOpacity={0.1} stroke="none" />
      {/* Output layer */}
      <circle cx={21} cy={12} r={1.8} fill="currentColor" fillOpacity={0.15} stroke="none" />
      {/* Input → hidden connections */}
      <line x1={4.8} y1={8} x2={10.2} y2={5.5} strokeOpacity={0.6} strokeWidth={1} />
      <line x1={4.8} y1={8.5} x2={10.2} y2={12} strokeOpacity={0.9} strokeWidth={1.2} />
      <line x1={4.8} y1={9} x2={10.2} y2={18.5} strokeOpacity={0.3} strokeWidth={1} />
      <line x1={4.8} y1={15.5} x2={10.2} y2={5.5} strokeOpacity={0.3} strokeWidth={1} />
      <line x1={4.8} y1={16} x2={10.2} y2={12} strokeOpacity={0.6} strokeWidth={1} />
      <line x1={4.8} y1={16.5} x2={10.2} y2={18.5} strokeOpacity={0.9} strokeWidth={1.2} />
      {/* Hidden → output connections */}
      <line x1={13.8} y1={5.5} x2={19.2} y2={12} strokeOpacity={0.4} strokeWidth={1} />
      <line x1={13.8} y1={12} x2={19.2} y2={12} strokeOpacity={0.9} strokeWidth={1.2} />
      <line x1={13.8} y1={18.5} x2={19.2} y2={12} strokeOpacity={0.4} strokeWidth={1} />
    </svg>
  );
}
