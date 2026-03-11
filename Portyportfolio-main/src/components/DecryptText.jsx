import React from 'react';
import { useDecrypt } from '../hooks/useDecrypt';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const DecryptText = ({ text, className = '' }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const decrypted = useDecrypt(text, isVisible);

  return (
    <span ref={ref} className={className}>
      {decrypted}
    </span>
  );
};
