import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import type { DeviceReference } from "@/lib/device-reference/types";
import { deviceReferenceService } from "@/lib/device-reference/service";
import { Loader2 } from "lucide-react";

interface DeviceReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (device: DeviceReference) => void;
}

export function DeviceReferenceDialog({
  open,
  onOpenChange,
  onSelect,
}: DeviceReferenceDialogProps) {
  const [devices, setDevices] = useState<DeviceReference[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const devices = await deviceReferenceService.getDeviceReferences();
        setDevices(devices);
      } catch (error) {
        console.error("Failed to load device references:", error);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadDevices();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>選擇參考設備</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              沒有可用的參考設備
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.MachineID}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  onSelect(device);
                  onOpenChange(false);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{device.MachineName}</div>
                    <div className="text-sm text-gray-500">
                      編號: {device.MachineID}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {device.KWHour !== null ? `${device.KWHour} 度` : "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
