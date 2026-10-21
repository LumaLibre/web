import type {StorePackage} from "@/scripts/model/Tebex.ts";
import {usePresence} from "@/components/ui/UsePresence.ts";
import PackageModal from "@/components/store/packagemodal/PackageModal.tsx";

export type OfferSelection = {
    offer: StorePackage;
    origin: {left: number; top: number; width: number; height: number};
};

// Share the actual purchase flow, including required options, Discord linking,
// usernames, gifting, limits and errors. Only the presentation differs.
export default function OfferPreview({selection, onClose}: {
    selection: OfferSelection | null;
    onClose: () => void;
}) {
    const {rendered} = usePresence(selection);
    return <PackageModal storePackage={selection?.offer ?? null} onClose={onClose}
                         offerOrigin={rendered?.origin}/>;
}
