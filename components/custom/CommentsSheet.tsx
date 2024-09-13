import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { sheetStore } from "@/store";
import { MoreVertical, MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type props = {
  selectedUser: any;
  setSelectedUser: any;
  comments: any;
  deleteComment:any;
};

export function CommentsSheet({
  selectedUser,
  setSelectedUser,
  comments,
  deleteComment
}: props) {
  const { isCommentsSheetOpen, setIsCommentsSheetOpen } = sheetStore();
  const handleSheetChange = () => {
    setIsCommentsSheetOpen(false);
  };
  return (
    <Sheet open={isCommentsSheetOpen} onOpenChange={handleSheetChange}>
      <SheetContent className="bg-white overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>
            <div className="w-full flex flex-col items-center gap-3">
              <img
                className="h-16 w-16 rounded-full"
                src={selectedUser?.photoUrl}
                alt=""
              />
              <h1>{selectedUser?.userName}</h1>
            </div>
          </SheetTitle>
          <SheetDescription>
            You can delete the comments permenantly.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-1 py-4">
          {comments?.map((comment: any, index: any) => (
            <div
              className="bg-slate-100 p-3 rounded-lg flex items-center justify-between"
              key={index}
            >
              <div className="flex flex-col  gap-2">
                <div className="flex items-center gap-3">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={comment?.commentFromPhoto}
                    alt=""
                  />
                  <h1 className="text-sm font-semibold">
                    {comment?.commentFromName}
                  </h1>
                </div>

                <p className="text-sm">{comment?.comment}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVerticalIcon size={15} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={()=>{deleteComment(comment)}}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
