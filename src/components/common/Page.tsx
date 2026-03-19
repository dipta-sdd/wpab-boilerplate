const Page = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`optionbay-p-x-page-default ${className}`}>{children}</div>
  );
};

export default Page;
