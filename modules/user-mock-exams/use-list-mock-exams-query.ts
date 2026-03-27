/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "@aws-amplify/auth";
import { appConfig } from "@/lib/app-config";
import { MockExam } from "./user-mock-exams.types";

const listMockExamsApi = async ({
  courseId,
  resp = [],
  lastEvaluatedKey,
}: {
  courseId: string;
  resp?: MockExam[];
  lastEvaluatedKey?: {
    userId: string;
    id: string;
  };
}): Promise<MockExam[]> => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("No authentication token");
  }

  const url = new URL("/dev/mocks", appConfig.NEXT_PUBLIC_API_BASE_URL);

  url.searchParams.set("courseId", courseId);

  if (lastEvaluatedKey?.id) {
    url.searchParams.set("id", lastEvaluatedKey.id);
  }

  if (lastEvaluatedKey?.userId) {
    url.searchParams.set("userId", lastEvaluatedKey.userId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch mock exams");
  }

  const respJson = await response.json();

  if (respJson.lastEvaluatedKey) {
    return listMockExamsApi({
      courseId,
      resp: resp.concat(respJson.mockExams),
      lastEvaluatedKey: respJson.lastEvaluatedKey,
    });
  }

  return resp.concat(respJson.mockExams);
};

export function useListMockExamsQuery(courseId: string) {
  return useQuery({
    queryKey: ["mockExams", courseId],
    queryFn: async (): Promise<MockExam[]> => {
      const mockExams = await listMockExamsApi({ courseId });

      return mockExams;
    },
    enabled: !!courseId,
  });
}
