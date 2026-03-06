import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TreeItem } from "@shared/schema";
import { FolderTree, ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";

interface FileTreeViewProps {
  tree: TreeItem[];
}

interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: TreeNode[];
  size?: number;
}

function buildTree(items: TreeItem[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const item of items) {
    const parts = item.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      let existing = current.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: isLast ? item.type : "tree",
          children: [],
          size: isLast ? item.size : undefined,
        };
        current.push(existing);
      }

      current = existing.children;
    }
  }

  function sortNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.sort((a, b) => {
      if (a.type === "tree" && b.type !== "tree") return -1;
      if (a.type !== "tree" && b.type === "tree") return 1;
      return a.name.localeCompare(b.name);
    });
  }

  function sortAll(nodes: TreeNode[]): TreeNode[] {
    for (const node of nodes) {
      node.children = sortAll(sortNodes(node.children));
    }
    return sortNodes(nodes);
  }

  return sortAll(root);
}

function TreeNodeRow({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isOpen = expanded.has(node.path);
  const isDir = node.type === "tree";

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-1 py-0.5 rounded-sm text-sm w-full text-left"
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => isDir && onToggle(node.path)}
        aria-expanded={isDir ? isOpen : undefined}
        data-testid={`tree-item-${node.path}`}
      >
        {isDir ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </>
        )}
        <span className={`font-mono text-xs ml-1 truncate ${isDir ? "font-medium" : ""}`}>
          {node.name}
        </span>
      </button>
      {isDir && isOpen && (
        <>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </>
      )}
    </>
  );
}

export function FileTreeView({ tree }: FileTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const topDirs = tree.filter((t) => !t.path.includes("/") && t.type === "tree");
    topDirs.forEach((d) => initial.add(d.path));
    return initial;
  });

  const [showAll, setShowAll] = useState(false);

  const treeNodes = useMemo(() => buildTree(tree), [tree]);

  if (tree.length === 0) return null;

  const toggleNode = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const displayNodes = showAll ? treeNodes : treeNodes.slice(0, 15);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FolderTree className="w-4 h-4 text-muted-foreground" />
            Repository Structure
          </div>
          <span className="text-xs text-muted-foreground font-normal">{tree.length} items</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-md p-3 max-h-80 overflow-y-auto">
          {displayNodes.map((node) => (
            <TreeNodeRow
              key={node.path}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={toggleNode}
            />
          ))}
        </div>
        {treeNodes.length > 15 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-xs"
            onClick={() => setShowAll(!showAll)}
            data-testid="button-toggle-tree"
          >
            {showAll ? "Show less" : `Show all ${treeNodes.length} top-level items`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
