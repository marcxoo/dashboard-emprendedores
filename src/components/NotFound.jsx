import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <section className="bg-white font-serif min-h-screen flex items-center justify-center p-4">
            <div className="container mx-auto">
                <div className="flex justify-center">
                    <div className="w-full sm:w-10/12 md:w-8/12 text-center">
                        <div
                            className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-contain"
                            aria-hidden="true"
                        >
                            <h1 className="text-center text-black text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8 font-black">
                                404
                            </h1>
                        </div>

                        <div className="mt-[-50px]">
                            <h3 className="text-2xl text-black sm:text-3xl font-bold mb-4">
                                Página no encontrada
                            </h3>
                            <p className="mb-6 text-black sm:mb-5 font-medium">
                                La página que buscas no existe o ha sido movida. Verifique la URL e intente nuevamente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
