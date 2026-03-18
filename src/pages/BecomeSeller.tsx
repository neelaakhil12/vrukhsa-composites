import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin, Store } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    businessName: z.string().min(2, {
        message: "Business name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
    address: z.string().min(5, {
        message: "Address must be at least 5 characters.",
    }),
    description: z.string().optional(),
});

const BecomeSeller = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            businessName: "",
            email: "",
            phone: "",
            address: "",
            description: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast.success("Application Submitted", {
            description: "We have received your request to become a seller. We will contact you shortly."
        });
        form.reset();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Start Selling with Us</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Join our marketplace and reach millions of customers. Register your business today and start your journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Benefits Section */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Why Sell Here?</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                                            <Store className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Wide Reach</h4>
                                            <p className="text-sm text-muted-foreground">Access a massive customer base instantly.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                                            <Building2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Business Tools</h4>
                                            <p className="text-sm text-muted-foreground">Powerful analytics and management tools.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full h-fit">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">24/7 Support</h4>
                                            <p className="text-sm text-muted-foreground">Dedicated support team for sellers.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Form Section */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Seller Registration</CardTitle>
                                    <CardDescription>Fill out the form below to register your business.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="fullName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="John Doe" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="+1 234 567 890" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="businessName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Business Name</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input className="pl-9" placeholder="Your Business Ltd." {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Business Email</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input className="pl-9" placeholder="business@example.com" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Business Address</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                <Textarea className="pl-9 min-h-[80px]" placeholder="123 Business St, City, Country" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Business Description (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Tell us about what you sell..." {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Briefly describe the products you intend to sell.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button type="submit" className="w-full text-lg h-11">Register Now</Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BecomeSeller;
