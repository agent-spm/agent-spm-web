import { SEED_SKILLS } from "@/lib/data/mock-store";
import SkillDetailClient from "./SkillDetailClient";

export async function generateStaticParams() {
  const params: { scope: string; name: string }[] = [];

  SEED_SKILLS.forEach((skill) => {
    params.push({
      scope: skill.scope,
      name: skill.name,
    });
    if (skill.scope.startsWith("@")) {
      params.push({
        scope: skill.scope.slice(1),
        name: skill.name,
      });
    }
  });

  // Deduplicate
  return params.filter(
    (item, index, self) =>
      self.findIndex(
        (t) => t.scope === item.scope && t.name === item.name
      ) === index
  );
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ scope: string; name: string }>;
}) {
  const resolvedParams = await params;
  return (
    <SkillDetailClient
      scope={resolvedParams.scope}
      name={resolvedParams.name}
    />
  );
}
