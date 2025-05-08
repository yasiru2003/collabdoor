
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementsList } from "./AnnouncementsList";

export function AdminAnnouncements() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Announcements</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <AnnouncementForm />
        </div>
        <div>
          <AnnouncementsList />
        </div>
      </div>
    </div>
  );
}
