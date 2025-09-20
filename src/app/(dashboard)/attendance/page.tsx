"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Download,
} from "lucide-react";
import { apiClient } from "@/data/api/client";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface AttendanceRecord {
  id: string;
  studentId: string;
  student: {
    name: string;
    studentId: string;
  };
  status: string;
  date: string;
  notes?: string;
}

export default function AttendancePage() {
  const { t } = useTranslation("attendance");
  const { t: tCommon } = useTranslation("common");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedGroup, setSelectedGroup] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, string>
  >({});

  const queryClient = useQueryClient();

  // Fetch groups
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const response = await apiClient.get<any[]>("/groups");
      return Array.isArray(response) ? response : (response as any)?.data || [];
    },
  });

  // Fetch students for selected group
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const response = await apiClient.get<any>(
        `/students?groupId=${selectedGroup}`,
      );
      // Handle both direct array and paginated response
      return Array.isArray(response) ? response : (response as any)?.data || [];
    },
    enabled: !!selectedGroup,
  });

  // Fetch attendance for selected date and group
  const { data: attendance, refetch: refetchAttendance } = useQuery({
    queryKey: ["attendance", selectedDate, selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const response = await apiClient.get<AttendanceRecord[]>(
        `/attendance?date=${selectedDate}&groupId=${selectedGroup}`,
      );
      // Initialize attendance records
      const records: Record<string, string> = {};
      response.forEach((record: AttendanceRecord) => {
        records[record.studentId] = record.status;
      });
      setAttendanceRecords(records);
      return response;
    },
    enabled: !!selectedGroup && !!selectedDate,
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (data: {
      studentId: string;
      groupId: string;
      date: string;
      status: string;
    }) => {
      return apiClient.post("/attendance", data);
    },
    onSuccess: () => {
      toast.success("Attendance marked");
      refetchAttendance();
    },
    onError: () => {
      toast.error("Failed to mark attendance");
    },
  });

  const handleMarkAttendance = async (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
    await markAttendanceMutation.mutateAsync({
      studentId,
      groupId: selectedGroup,
      date: selectedDate,
      status,
    });
  };

  const handleBulkMark = async (status: string) => {
    if (!students) return;

    const promises = students.map((student: any) =>
      markAttendanceMutation.mutateAsync({
        studentId: student.id,
        groupId: selectedGroup,
        date: selectedDate,
        status,
      }),
    );

    await Promise.all(promises);
    toast.success(`All students marked as ${status.toLowerCase()}`);
  };

  const getAttendanceStats = () => {
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    Object.values(attendanceRecords).forEach((status) => {
      switch (status) {
        case "PRESENT":
          stats.present++;
          break;
        case "ABSENT":
          stats.absent++;
          break;
        case "LATE":
          stats.late++;
          break;
        case "EXCUSED":
          stats.excused++;
          break;
      }
    });

    return stats;
  };

  const stats = getAttendanceStats();
  const totalStudents = students?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-600 mt-1">{t("subtitle")}</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="group">Group</Label>
              <select
                id="group"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a group</option>
                {groups?.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                disabled={!selectedGroup}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedGroup && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.present}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.absent}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.late}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Excused</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.excused}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkMark("PRESENT")}
                  variant="outline"
                  className="flex-1"
                >
                  Mark All Present
                </Button>
                <Button
                  onClick={() => handleBulkMark("ABSENT")}
                  variant="outline"
                  className="flex-1"
                >
                  Mark All Absent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading students...
                </div>
              ) : students && students.length > 0 ? (
                <div className="space-y-2">
                  {students.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">
                          {student.studentId}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={
                            attendanceRecords[student.id] === "PRESENT"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(student.id, "PRESENT")
                          }
                          className={
                            attendanceRecords[student.id] === "PRESENT"
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                        >
                          P
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            attendanceRecords[student.id] === "ABSENT"
                              ? "destructive"
                              : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(student.id, "ABSENT")
                          }
                        >
                          A
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            attendanceRecords[student.id] === "LATE"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(student.id, "LATE")
                          }
                          className={
                            attendanceRecords[student.id] === "LATE"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : ""
                          }
                        >
                          L
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            attendanceRecords[student.id] === "EXCUSED"
                              ? "secondary"
                              : "outline"
                          }
                          onClick={() =>
                            handleMarkAttendance(student.id, "EXCUSED")
                          }
                        >
                          E
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No students found in this group.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedGroup && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Please select a group to mark attendance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
