import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PackageCard from "@/components/ui/packageCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logError } from "@/services/Error/ErrorLogs";
import { getPackageModalData } from "@/services/Package/Member";
import { createClientSide } from "@/utils/supabase/client";
import {
  company_earnings_table,
  company_member_table,
  package_table,
} from "@prisma/client";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DashboardDynamicGuideModal from "../DashboardDynamicGuideModal/DashboardDynamicGuideModal";

type Props = {
  className: string;
  teamMemberProfile: company_member_table;
  packages: package_table[];
  earnings: company_earnings_table | null;
  setIsActive: Dispatch<SetStateAction<boolean>>;
};

const DashboardDepositModalPackages = ({
  className,
  packages: initialPackage,
  teamMemberProfile,
  earnings,
  setIsActive,
}: Props) => {
  const supabaseClient = createClientSide();
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    initialPackage[0] || null
  );
  const [packages, setPackages] = useState<package_table[]>(initialPackage);

  const handlePackageSelect = (pkg: package_table) => {
    if (earnings?.company_combined_earnings === 0) return null;
    setSelectedPackage(pkg);
  };

  useEffect(() => {
    const packagesData = async () => {
      try {
        if (!open || packages.length > 0) return;
        const data = await getPackageModalData();

        setPackages(data);
        if (!teamMemberProfile.company_member_is_active) {
          setIsActive(true);
        }
      } catch (e) {
        if (e instanceof Error) {
          await logError(supabaseClient, {
            errorMessage: e.message,
            stackTrace: e.stack,
            stackPath:
              "components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal.tsx",
          });
        }
      }
    };

    packagesData();
  }, [packages, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setSelectedPackage(null);
        }
      }}
    >
      <DialogTrigger asChild className={className}>
        <Button
          className="h-44 flex items-center justify-start px-4 sm:justify-around sm:items-center text-xl sm:text-4xl max-w-full"
          onClick={() => setOpen(true)}
        >
          <p className="break-words whitespace-normal text-center">
            Select Your Plan Here:
          </p>
          <Image
            src="/assets/packages.png"
            alt="deposit"
            width={170}
            height={170}
            className="relative"
          />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]" type="earnings">
        <ScrollArea className="h-[650px] sm:h-[850px]">
          <DialogHeader className="text-start text-2xl font-bold">
            <DialogTitle className="text-2xl font-bold mb-4 flex justify-between gap-2">
              Avail Supreme Plan
              <DashboardDynamicGuideModal type="avail" />
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex justify-between gap-4 p-2">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.package_id}
                packageId={pkg.package_id}
                packageName={pkg.package_name}
                selectedPackage={selectedPackage}
                packageColor={pkg.package_color || undefined}
                packageImage={pkg.package_image || undefined}
                onClick={() => handlePackageSelect(pkg)}
              />
            ))}
          </div>

          <AvailPackagePage
            setOpen={setOpen}
            setSelectedPackage={setSelectedPackage}
            earnings={earnings}
            pkg={selectedPackage || []}
            teamMemberProfile={teamMemberProfile}
            selectedPackage={selectedPackage}
          />

          <DialogFooter></DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalPackages;
