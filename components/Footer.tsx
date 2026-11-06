export default function Footer() {
  return (
    <footer suppressHydrationWarning className="mt-8 border-t border-gray-200 py-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
      © {new Date().getFullYear()} dataforyou. All rights reserved.
    </footer>
  );
}