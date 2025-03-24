/*
---------------------------------------------------
Project:        FundingProject
Date:           Oct 18, 2024
Revised Date:   Oct 21, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles Footer component (adjust padding and margin).
---------------------------------------------------
*/
import Image from "next/image";
import Link from "next/link";
import { IoLogoFacebook } from "react-icons/io5";
import { FaTwitterSquare } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div className="container mx-auto w-full max-w-full">
    <footer className="bg-BgColor mx-auto w-full max-w-full p-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="max-w-md w-full text-center md:text-left">
          <Image
            src={"/bg-remove-logo.png"}
            alt={"logo"}
            width={150}
            height={50}
            className="rounded-full"
          />
          <p className="text-white hover:text-orange-400">
            Brief description or mission statement about the organization,
            purpose, or values.
          </p>
        </div>

        {/* Right Section with Links */}
        <div className="flex flex-col gap-4 md:gap-20 justify-end text-center sm:grid sm:grid-cols-3">
          <div>
            <h4 className="text-lg font-semibold hover:text-orange-400">Donate</h4>
            <ul className="flex flex-col">
              <Link href={"#"}>Education</Link>
              <Link href={"#"}>Healthcare</Link>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold hover:text-orange-400">Help</h4>
            <ul className="flex flex-col">
              <Link href={"#"}>FAQs</Link>
              <Link href={"#"}>Contact Us</Link>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold hover:text-orange-400">Company</h4>
            <ul className="flex flex-col">
              <Link href={"#"}>About Us</Link>
              <Link href={"#"}>Services</Link>
            </ul>
          </div>
        </div>
      </div>
      <div className="border border-t-gray-800"></div>
      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="mt-8 text-center md:text-left text-gray-white">
          &copy; 2024 Funder. <br /> All rights reserved.
        </div>
        <div className="hidden md:flex md:space-x-4 md:items-center md:pt-5 justify-end">
          <button className="bg-orange-400 hover:bg-orange-500 px-6 py-2 rounded-full flex items-center">
            <IoLogoFacebook size={20} className="mr-2" />
            Facebook
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 px-6 py-2 rounded-full flex items-center">
            <FaTwitterSquare size={20} className="mr-2" />
            Twitter
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 px-6 py-2 rounded-full flex items-center">
            <MdOutlineEmail size={20} className="mr-2" />
            Email
          </button>
        </div>
        <div className="flex space-x-4 justify-center items-center md:hidden">
          <button className="bg-orange-400 hover:bg-orange-500 items-center">
            <IoLogoFacebook size={25} />
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 items-center">
            <FaTwitterSquare size={25} />
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 items-center">
            <MdOutlineEmail size={25} />
          </button>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Footer;
