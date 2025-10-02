type BuildOptions = {
	verbose : boolean;
};

export async function build(
	canister : string | undefined,
	options : Partial<BuildOptions>,
) : Promise<void> {
	console.log(canister, options); ///
}
