const Header = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`optionbay-text-[20px] optionbay-font-[700] optionbay-leading-[30px] optionbay-text-[#000000]  ${className}`}
    >
      {children}
    </div>
  );
};
export default Header;
