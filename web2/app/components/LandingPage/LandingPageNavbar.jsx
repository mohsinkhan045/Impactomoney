"use client";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const routes = [
    {
      name: "Home",
      href: "#",
    },
    {
      name: "Donation",
      href: "#",
    },
    {
      name: "How it Works",
      href: "#",
    },
    {
      name: "About Us",
      href: "#",
    },
  ];

  return (
    <nav className="bg-white text-black shadow-md sticky top-0 w-full z-50">
      <div className="flex items-center justify-between px-3  max-w-7xl ">
        {/* Left Side - Logo */}
        
          <Image
            src={"/bg-remove-logo.png"}
            alt={"logo"}
            width={130}
            height={120}
            className=""
          />
        

        {/* Hamburger Menu Icon */}
        <div className=" md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <AiOutlineClose size={30} className="text-black" />
            ) : (
              <AiOutlineMenu size={30} className="text-black" />
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-lg">
          {routes.map((route, index) => (
            <Link
              href={route.href}
              key={index}
              className={`${
                route.href === pathname ? "bg-white/10" : "text-black"
              } px-3 rounded-xl`}
            >
              {route.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <div className="hidden md:block  gap-2">
            <Link href={"/contributor"}>
              <button className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded-xl">
                Donate
              </button>
            </Link>
            <Link href={"/login"}>
              <button className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded-xl ml-5">
                Login
              </button>
            </Link>
          </div>

          {/* <Link href={"/register"} className="bg-yellow-600 px-4 py-2 rounded-xl">
          Sign-up
          </Link> */}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 px-6 py-4 bg-white text-blue-700">
          {/* {routes.map((route, index) => (
            <Link
              href={route.href}
              key={index}
              className={`${
                route.href === pathname ? "bg-white/10" : "text-black"
              } px-3 py-2 rounded-xl w-full text-center`}
              onClick={() => setMenuOpen(false)}
            >
              {route.name}
            </Link>
          ))} */}
          <button className="bg-yellow-600 px-4 py-2 rounded-xl w-full text-center">Donate</button>
          <div className="flex flex-col gap-4 items-center w-full">
            <Link
              href={"/login"}
              className="bg-yellow-600 px-4 py-2 rounded-xl w-full text-center"
            >
              Login
            </Link>
            <Link
              href={"/register"}
              className="bg-yellow-600 px-4 py-2 rounded-xl w-full text-center"
            >
              Sign-up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
