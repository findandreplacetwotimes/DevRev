import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { TableCell } from "./TableCell"
import { TabPageTitle } from "./TabPageTitle"

const headerLabelStyle = {
  fontFamily: '"Chip Mono", "Chip Text Variable", ui-monospace, monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
  color: "var(--control-content-secondary)",
}

const members = [
  { name: "Manasa Lingamallu", role: "Product Manager", email: "manasa.lingamallu@devrev.ai" },
  { name: "Aarav Patel", role: "UX Designer", email: "aarav.patel@devrev.ai" },
  { name: "Sahana Reddy", role: "Data Scientist", email: "sahana.reddy@devrev.ai" },
  { name: "Rohan Mehta", role: "Machine Learning Engineer", email: "rohan.mehta@devrev.ai" },
  { name: "Isha Kapoor", role: "AI Researcher", email: "isha.kapoor@devrev.ai" },
  { name: "Nikhil Sharma", role: "Data Analyst", email: "nikhil.sharma@devrev.ai" },
  { name: "Leah Foster", role: "Product Designer", email: "leah.foster@devrev.ai" },
  { name: "Noah Brooks", role: "Frontend Engineer", email: "noah.brooks@devrev.ai" },
  { name: "Emily Rivera", role: "Backend Engineer", email: "emily.rivera@devrev.ai" },
  { name: "Jason Brooks", role: "Engineering Manager", email: "jason.brooks@devrev.ai" },
  { name: "Nina Patel", role: "QA Engineer", email: "nina.patel@devrev.ai" },
  { name: "Lucas Nguyen", role: "Data Engineer", email: "lucas.nguyen@devrev.ai" },
  { name: "Maya Iyer", role: "Researcher", email: "maya.iyer@devrev.ai" },
  { name: "Ethan Cole", role: "Security Engineer", email: "ethan.cole@devrev.ai" },
  { name: "Olivia Khan", role: "DevOps Engineer", email: "olivia.khan@devrev.ai" },
  { name: "Arjun Rao", role: "UX Researcher", email: "arjun.rao@devrev.ai" },
  { name: "Zara Malik", role: "Technical Writer", email: "zara.malik@devrev.ai" },
  { name: "Daniel Park", role: "Solutions Engineer", email: "daniel.park@devrev.ai" },
  { name: "Priya Sen", role: "Customer Success", email: "priya.sen@devrev.ai" },
  { name: "Samir Das", role: "Program Manager", email: "samir.das@devrev.ai" },
]

export function TeamMembersPage() {
  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-[2px] bg-white" aria-label="Team members">
      <div className="min-h-[56px] w-full shrink-0">
        <header className="w-full p-[14px]">
          <div className="flex w-full items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-wrap items-center gap-[4px]">
              <Breadcrumbs
                segments={[
                  { label: "About", href: "/about", iconName: "team", showIcon: true },
                  { label: "Team", showIcon: false },
                ]}
              />
            </div>
            <Control type="iconOnly" leadingIcon="more" label="" />
          </div>
        </header>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-0">
        <div className="w-full shrink-0 px-[44px] pt-[36px]">
          <div className="w-full">
            <TabPageTitle>Team</TabPageTitle>
          </div>
        </div>

        <div className="mt-[24px] w-full min-w-0">
          <div className="grid h-[28px] w-full grid-cols-[44px_1fr_220px_220px_44px] items-center border-b border-[#f2f2f3]">
            <div />
            <div className="pl-[0px] uppercase" style={headerLabelStyle}>NAME</div>
            <div className="uppercase" style={headerLabelStyle}>ROLE</div>
            <div className="uppercase" style={headerLabelStyle}>E-MAIL</div>
            <div />
          </div>
          {members.map((member) => (
            <div
              key={member.email}
              className="group grid w-full grid-cols-[44px_1fr_220px_220px_44px] items-center transition-colors duration-150 hover:bg-[var(--control-bg-rest)]"
            >
              <div className="h-full border-b border-[#f2f2f3]" />
              <TableCell
                type="team"
                teamName={member.name}
                teamInitial={(member.name?.trim()?.[0] ?? "M").toUpperCase()}
                className="pr-[20px]"
              />
              <TableCell type="smallText" smallText={member.role} />
              <TableCell type="smallText" smallText={member.email} />
              <div className="h-full border-b border-[#f2f2f3]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
