import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useState } from "react";

const ReportsTab = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          accommodations (
            property_name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete report");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const filteredReports = reports?.filter((report: any) => {
    if (statusFilter === "all") return true;
    return report.status === statusFilter;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{filteredReports?.length || 0} reports</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports && filteredReports.length > 0 ? (
              filteredReports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Link 
                      to={`/listing/${report.accommodation_id}`} 
                      target="_blank"
                      className="text-primary hover:underline"
                    >
                      {report.accommodations?.property_name || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{report.reporter_name || "Anonymous"}</div>
                      <div className="text-muted-foreground">{report.reporter_email || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell className="max-w-xs truncate">{report.details}</TableCell>
                  <TableCell>
                    <Select
                      value={report.status || "pending"}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: report.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="ignored">Ignored</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(report.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {statusFilter === "all" ? "No reports yet" : `No ${statusFilter} reports`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportsTab;
