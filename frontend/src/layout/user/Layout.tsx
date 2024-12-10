interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        
        <div className="container mx-auto px-5 lg:px-8 py-10 flex-1">
            {children}
        </div>
    );
}

export default Layout;
