import React from 'react';

export function Badge({ children, variant = 'gold' }) {
  const variantClass = variant === 'success' ? 'badge-success' : variant === 'danger' ? 'badge-danger' : variant === 'neutral' ? 'badge-neutral' : 'badge-gold';

  return <span className={`badge ${variantClass}`}>{children}</span>;
}
