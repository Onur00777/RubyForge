import { CodingArena } from "@/components/arena/CodingArena";

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CodingArena stageId={Number(id)} />;
}
