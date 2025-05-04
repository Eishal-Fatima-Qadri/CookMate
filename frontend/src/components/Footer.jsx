export default function Footer() {
  return (
    <footer
      style={{ backgroundColor: "#131A24" }}
      className="text-white p-4 shadow-md"
    >
      <p>&copy; {new Date().getFullYear()} CookMate. All rights reserved.</p>
    </footer>
  );
}
