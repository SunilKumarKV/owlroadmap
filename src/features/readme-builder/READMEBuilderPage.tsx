"use client";

import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useReadmeStore from '@/stores/readme-store';

const READMEBuilderPage = () => {
  const { name, role, about, skills, projects, socials, setName, setRole, setAbout, setSkills, setProjects, setSocials } = useReadmeStore();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Create Your GitHub README</h1>
      <form className="space-y-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
        <Input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Your Role"
        />
        <Textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="About You"
        />
        <Textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Skills (comma-separated)"
        />
        <Textarea
          value={projects}
          onChange={(e) => setProjects(e.target.value)}
          placeholder="Projects (comma-separated)"
        />
        <Textarea
          value={socials}
          onChange={(e) => setSocials(e.target.value)}
          placeholder="Social Links (comma-separated)"
        />
      </form>
      <div className="flex space-x-4 mt-8">
        <Button href="/roadmap-builder" variant="secondary">Create Roadmap</Button>
        <Button onClick={() => alert('Preview README.md')} variant="primary">Preview Markdown</Button>
      </div>
    </div>
  );
};

export default READMEBuilderPage;
