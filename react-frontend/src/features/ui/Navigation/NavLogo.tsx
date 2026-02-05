const NavLogo = ({ className }: { className?: string }) => {
    return (
        <a href={"#"} className={`${className} select-none`.trim()}>
            <span
                className={
                    "inline-block text-xl font-bold transition-transform duration-700 hover:-translate-y-0.25"
                }
            >
                Elixer Focus <sub className={"text-[0.5rem]"}>TM</sub>
            </span>
        </a>
    );
};

export default NavLogo;
