import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { RiChatUploadFill } from "react-icons/ri";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Button from "../Button";
import { Input } from "../ui/input";

const ITRRetrievalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = Cookies.get("authToken");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        router.push("/auth/log-in");
        return;
      }

      const response = await axios.post(
        "https://api-dev.assuredsum.com/api/v1/getMyITR",
        { userName, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        toast.success("ITR data retrieved successfully!");
        setIsOpen(false);
        // You might want to update the parent component's state or trigger a re-fetch of user data here
      } else {
        toast.error("Failed to retrieve ITR data. Please try again.");
      }
    } catch (error) {
      console.error("Error retrieving ITR data:", error);
      toast.error(
        "An error occurred while retrieving ITR data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl max-w-md border-2 border-dashed border-gray-300">
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center border-gray-300 rounded-lg p-6">
          <RiChatUploadFill className="text-4xl text-[#8E30A0]" />
          <label className="block text-gray-700 font-medium mb-2">
            No ITR on hand? No problem!
          </label>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="bg-[#8E30A0] text-white py-2 px-20 rounded"
                onClick={() => setIsOpen(true)}
              >
                Get My ITR
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Enter ITR Credentials</DialogTitle>
                <DialogDescription>
                  Please provide your username and password to retrieve your ITR
                  data.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUsername(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                   //@ts-ignore
                   type="submit" disabled={isLoading}>
                    {isLoading ? "Retrieving..." : "Get ITR"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ITRRetrievalComponent;
