interface ContactAvatarProps {
  firstname: string;
  lastname: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

export function ContactAvatar({ firstname, lastname, size = 'md' }: ContactAvatarProps) {
  const initials = (firstname ? `${firstname[0]}${lastname[0]}` : lastname.slice(0, 2)).toUpperCase();

  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full bg-[#92400E] text-white flex items-center justify-center font-semibold shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}
