const NavLogo = ({ className }: { className?: string }) => {
    return (
        <a href={"#"} className={`${className} select-none`.trim()}>
            <span className={"text-xl font-bold"}>Elixer Focus</span>
        </a>
    );
};

export default NavLogo;
