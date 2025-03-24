"use client"
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../../@/components/ui/card";
import { IoIosArrowBack } from "react-icons/io";
import CustomButton from "../../../components/AdminDashboard/button";
import DonateSection from "../../../components/AdminDashboard/DonationSection";
import InstitutionComponent from "../../../components/AdminDashboard/institution";
import IssuedVoucherBeneficiaries from "../../../components/AdminDashboard/issuedVoucherBeneficiaries";

export default function Page({onTabChange}) {
  const [selectedPage, setSelectedPage] = useState(null);

  const handleTabChange = (value) => {
    // Handle tab change logic here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="relative w-full py-20 max-w-3xl shadow-lg rounded-xl border border-gray-200 bg-gradient-to-br from-white via-blue-300 to-gray-50">
      <button
                className="absolute bottom-3 left-3 mt-4 text-sm text-blue-600 hover:underline mr-auto"
                onClick={() => setSelectedPage(null)}
              >
              <IoIosArrowBack size={40}/>
              </button>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 ">
            {selectedPage ? `Voucher to ${selectedPage}` : "Choose one...!"}
          </CardTitle>
          <CardDescription className="text-md text-gray-600">
            {selectedPage
              ? "Provide your details below."
              : "Who do you want to distribute?"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col ">
          {selectedPage === null ? (
            <div className="flex flex-col md:flex-row justify-center gap-3">
              <CustomButton
                button="Individual"
                onClick={() => setSelectedPage("Individual")}
              />
              <CustomButton
                button="Institution"
                onClick={() => setSelectedPage("Institution")}
              />
            </div>
          ) : (
            <div>
              {selectedPage === "Individual" ? (
                <DonateSection onTabChange={onTabChange} />
              ) : (
                <InstitutionComponent />
              )}
             
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
