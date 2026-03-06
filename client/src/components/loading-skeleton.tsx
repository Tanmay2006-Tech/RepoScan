import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded-md ${className || ""}`} />;
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6" data-testid="container-loading-skeleton">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Pulse className="w-5 h-5 rounded-md" />
          <div className="space-y-2">
            <Pulse className="h-5 w-48" />
            <Pulse className="h-3 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pulse className="h-8 w-24 rounded-md" />
          <Pulse className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <Pulse className="w-24 h-24 rounded-xl" />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Pulse className="h-6 w-40" />
                <Pulse className="h-4 w-24" />
                <Pulse className="h-5 w-20 rounded-full" />
              </div>
              <Pulse className="h-4 w-3/4" />
              <div className="flex flex-wrap gap-3">
                <Pulse className="h-3 w-28" />
                <Pulse className="h-3 w-24" />
                <Pulse className="h-3 w-32" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="text-center p-2 rounded-md bg-muted/40">
                    <Pulse className="h-6 w-10 mx-auto mb-1" />
                    <Pulse className="h-2 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-5/6" />
              <Pulse className="h-4 w-4/6" />
              <div className="flex flex-wrap gap-2 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Pulse key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
                  <Pulse className="w-10 h-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Pulse className="h-4 w-40" />
                    <Pulse className="h-3 w-64" />
                  </div>
                  <Pulse className="h-5 w-12 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Pulse className="w-4 h-4 rounded-full" />
                    <Pulse className="h-3 w-32" />
                  </div>
                  <Pulse className="h-3 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-32" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 pt-2">
              <Pulse className="w-32 h-32 rounded-full" />
              <Pulse className="h-4 w-20" />
              <div className="w-full space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <Pulse className="h-3 w-24" />
                      <Pulse className="h-3 w-10" />
                    </div>
                    <Pulse className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Pulse className="w-3 h-3 rounded-full" />
                  <Pulse className="h-3 w-20" />
                  <div className="flex-1">
                    <Pulse className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function RepoSkeleton() {
  return (
    <div className="space-y-6" data-testid="container-loading-skeleton">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Pulse className="w-10 h-10 rounded-md" />
          <div className="space-y-2">
            <Pulse className="h-5 w-48" />
            <Pulse className="h-3 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pulse className="h-8 w-24 rounded-md" />
          <Pulse className="h-8 w-48 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center space-y-2">
                  <Pulse className="h-4 w-8 mx-auto" />
                  <Pulse className="h-6 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <Pulse className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Pulse className="h-40 w-40 rounded-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Pulse className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Pulse className="h-40 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Pulse className="h-5 w-16 rounded-full" />
                  <Pulse className="h-3 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 3) * 16}px` }}>
                  <Pulse className="w-4 h-4" />
                  <Pulse className="h-3 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-28" />
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 pt-2">
              <Pulse className="w-32 h-32 rounded-full" />
              <Pulse className="h-4 w-20" />
              <div className="w-full space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <Pulse className="h-3 w-24" />
                      <Pulse className="h-3 w-10" />
                    </div>
                    <Pulse className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Pulse className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Pulse className="w-8 h-8 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Pulse className="h-3 w-24" />
                    <Pulse className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
