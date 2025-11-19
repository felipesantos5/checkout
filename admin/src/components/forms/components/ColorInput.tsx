import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const ColorInput = ({ field }: { field: any }) => (
  <div className="flex items-center gap-2 w-full max-w-full">
    <FormControl>
      <Input type="color" className="w-10 h-10 p-1 cursor-pointer shrink-0" {...field} />
    </FormControl>
    <FormControl>
      <Input type="text" placeholder="#2563EB" className="font-mono w-full max-w-[120px]" {...field} />
    </FormControl>
  </div>
);
