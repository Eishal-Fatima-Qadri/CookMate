export default function Footer() {
    return (
        <footer className="bg-green-600 text-white p-4 text-center fixed bottom-0 w-full">
            <p>&copy; {new Date().getFullYear()} CookMate. All rights reserved.</p>
        </footer>
    );
}