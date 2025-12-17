import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <>
            <main>{children}</main>
        </>
    );
};

export default AuthLayout;
