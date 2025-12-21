import ThemeLabel from "@features/Settings/ThemeSettings/ThemeLabel.tsx";

const ThemeSettings = () => {
    return (
        <fieldset className="px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {/*
                    Working Themes: These are themes that currently work well with the current design.
                    TODO: Fix the other themes!
                */}

                {/* Dark */}
                <ThemeLabel value="dark">Default</ThemeLabel>
                <ThemeLabel value="halloween">Halloween</ThemeLabel>
                <ThemeLabel value="forest">Forest</ThemeLabel>
                <ThemeLabel value="aqua">Aqua</ThemeLabel>
                <ThemeLabel value="dracula">Dracula</ThemeLabel>
                <ThemeLabel value="business">Business</ThemeLabel>
                <ThemeLabel value="night">Night</ThemeLabel>
                <ThemeLabel value="coffee">Coffee</ThemeLabel>
                <ThemeLabel value="dim">Dim</ThemeLabel>
                <ThemeLabel value="sunset">Sunset</ThemeLabel>
                <ThemeLabel value="abyss">Abyss</ThemeLabel>

                {/* Light */}
                <ThemeLabel value="valentine">Valentine</ThemeLabel>
                <ThemeLabel value="retro">Retro</ThemeLabel>
                <ThemeLabel value="cyberpunk">Cyberpunk</ThemeLabel>

                {/*
                    Non-working Themes.
                    TODO: Fix these!
                */}
                <ThemeLabel value="cupcake">Cupcake</ThemeLabel>
                <ThemeLabel value="emerald">Emerald</ThemeLabel>
                <ThemeLabel value="corporate">Corporate</ThemeLabel>
                <ThemeLabel value="bumblebee">Bumblebee</ThemeLabel>
                <ThemeLabel value="synthwave">Synthwave</ThemeLabel>
                <ThemeLabel value="garden">Garden</ThemeLabel>
                <ThemeLabel value="lofi">Lofi</ThemeLabel>
                <ThemeLabel value="pastel">Pastel</ThemeLabel>
                <ThemeLabel value="fantasy">Fantasy</ThemeLabel>
                <ThemeLabel value="wireframe">Wireframe</ThemeLabel>
                <ThemeLabel value="black">Black</ThemeLabel>
                <ThemeLabel value="luxury">Luxury</ThemeLabel>
                <ThemeLabel value="cmyk">Cmyk</ThemeLabel>
                <ThemeLabel value="autumn">Autumn</ThemeLabel>
                <ThemeLabel value="acid">Acid</ThemeLabel>
                <ThemeLabel value="lemonade">Lemonade</ThemeLabel>
                <ThemeLabel value="winter">Winter</ThemeLabel>
                <ThemeLabel value="nord">Nord</ThemeLabel>
                <ThemeLabel value="caramellatte">Caramellatte</ThemeLabel>
                <ThemeLabel value="silk">Silk</ThemeLabel>
            </div>
        </fieldset>
    );
};

export default ThemeSettings;
