"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { voiceDetails } from "@/constants";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GeneratePodcast from "@/components/GeneratePodcast";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { SelectGroup } from "@radix-ui/react-select";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Podcast title is required.",
  }),
  description: z.string().min(15, {
    message: "Description is required.",
  }),
});

const CreatePodcast = () => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [audioDuration, setAudioDuration] = useState(0);
  const [voiceType, setVoiceType] = useState({ voice: "", provider: "" });
  const [voicePrompt, setVoicePrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const createPodcast = useMutation(api.podcasts.createPodcast);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: "Failed to create podcast",
          description: "Please try again",
          variant: "destructive",
        });
        console.log("Audio or image is missing");
        setIsSubmitting(false);
        return;
      }
      const podcast = await createPodcast({
        title: data.title,
        description: data.description,
        voiceType: voiceType.voice,
        voicePrompt,
        audioUrl,
        audioStorageId: audioStorageId!,
        audioDuration,
        imagePrompt,
        views: 0,
        imageUrl,
        imageStorageId: imageStorageId!,
      });
      toast({
        title: "Podcast created successfully",
        description: "Your podcast has been created successfully",
      });
      setIsSubmitting(false);
      router.push(`/`);
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to create podcast",
        description: "Please try again",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
    setIsSubmitting(false);
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-20 font-bold text-white-1">Create Podcast</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Podcast Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="title"
                      className="input-class focus-visible:ring-offset-orange-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold text-white-1">
                Select AI Voice
              </Label>
              <Select
                onValueChange={(value) => {
                  const voice = value.split("--")[0];
                  const provider = value.split("--")[1];
                  setVoiceType({ voice, provider });
                  setIsPlaying(false);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "text-16 w-full bg-black-1 text-gray-1 border-none focus-visible:ring-offset-orange-1"
                  )}
                >
                  <SelectValue
                    placeholder="Select AI voice"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="bg-black-1 text-16 text-white-1 font-bold focus:ring-offset-orange-1 border-none">
                  {voiceDetails.map((voice) => (
                    <SelectGroup key={voice.provider}>
                      <SelectLabel className="text-white-3 font-light pl-4">
                        {voice.provider}
                      </SelectLabel>
                      {voice.voices.map((voiceName) => (
                        <SelectItem
                          key={voiceName}
                          value={`${voiceName}--${voice.provider}`}
                          className="capitalize focus:bg-orange-1"
                        >
                          {voiceName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              {voiceType.voice && (
                <audio
                  src={`https://podnest.vercel.app/${voiceType.voice}.mp3`}
                  controls
                  autoPlay={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(error) => console.error('Audio error:', error)}
                  className="hidden"
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short podcast description"
                      className="input-class focus-visible:ring-offset-orange-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col pt-10">
            <GeneratePodcast
              setAudioStorageId={setAudioStorageId}
              setAudioUrl={setAudioUrl}
              setAudioDuration={setAudioDuration}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              voiceType={voiceType.voice}
              voiceProvider={voiceType.provider}
              audioUrl={audioUrl}
            />
            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />
            <div className="mt-10 w-full pb-4">
              <Button
                type="submit"
                className="text-16 w-full bg-orange-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                {isSubmitting ? (
                  <>
                    Submitting
                    <Loader size={20} className="animate-spin ml-2" />
                  </>
                ) : (
                  "Submit & Publish Podcast"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePodcast;
