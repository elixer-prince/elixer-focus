interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const classes = "px-8 py-4";

  const combinedClasses = `${classes} ${className}`.trim();

  return (
    // Footer
    <footer className={combinedClasses}>
      {/* Copyright Info */}
      <p className="text-center">Elixer Focus &copy; 2025</p>
    </footer>
  );
};

export default Footer;
