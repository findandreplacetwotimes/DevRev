export const OWNERS = [
  { id: "olivia-brown", name: "Olivia Brown" },
  { id: "liam-johnson", name: "Liam Johnson" },
  { id: "ava-martinez", name: "Ava Martinez" },
  { id: "noah-anderson", name: "Noah Anderson" },
  { id: "mia-thompson", name: "Mia Thompson" },
  { id: "ethan-clark", name: "Ethan Clark" },
  { id: "isabella-davis", name: "Isabella Davis" },
  { id: "lucas-rodriguez", name: "Lucas Rodriguez" },
  { id: "sophia-walker", name: "Sophia Walker" },
  { id: "jackson-lee", name: "Jackson Lee" },
  { id: "alex-chen", name: "Alex Chen" },
  { id: "priya-kapoor", name: "Priya Kapoor" },
  { id: "dev-patel", name: "Dev Patel" },
  { id: "tim-brooks", name: "Tim Brooks" },
  { id: "sam-rivera", name: "Sam Rivera" },
]

export function getOwnerById(ownerId) {
  return OWNERS.find((owner) => owner.id === ownerId) ?? null
}
