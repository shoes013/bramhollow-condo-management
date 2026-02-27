import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CodeEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  language?: string;
}

const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  ({ className, language = "markdown", ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          "font-mono text-sm resize-none min-h-[400px] border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20",
          className
        )}
        spellCheck={false}
        {...props}
      />
    );
  }
);

CodeEditor.displayName = "CodeEditor";

export { CodeEditor };
