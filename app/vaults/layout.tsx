import React from 'react';

export default function VaultsLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <section className="h-full">
            <main className="">
                {children}
            </main>
        </section>
    );
}
