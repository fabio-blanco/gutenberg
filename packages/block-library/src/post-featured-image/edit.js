/**
 * WordPress dependencies
 */
import { useEntityProp, store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import {
	Icon,
	ToggleControl,
	PanelBody,
	Placeholder,
	withNotices,
	Button,
} from '@wordpress/components';
import {
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
} from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';
import { postFeaturedImage, upload } from '@wordpress/icons';
import { SVG, Path } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import DimensionControls from './dimension-controls';

const ALLOWED_MEDIA_TYPES = [ 'image' ];
const placeholderChip = (
	<div className="post-featured-image_placeholder">
		<Icon icon={ postFeaturedImage } />
		<p> { __( 'Featured Image' ) }</p>
	</div>
);

function PostFeaturedImageDisplay( {
	attributes,
	setAttributes,
	context: { postId, postType, queryId },
	noticeUI,
	noticeOperations,
} ) {
	const isDescendentOfQueryLoop = !! queryId;
	const { isLink, height, width, scale } = attributes;
	const [ featuredImage, setFeaturedImage ] = useEntityProp(
		'postType',
		postType,
		'featured_media',
		postId
	);

	const media = useSelect(
		( select ) =>
			featuredImage &&
			select( coreStore ).getMedia( featuredImage, { context: 'view' } ),
		[ featuredImage ]
	);

	const blockProps = useBlockProps( {
		style: { width },
	} );

	const placeholder = ( content ) => {
		return (
			<Placeholder className="block-editor-media-placeholder">
				{
					<SVG
						className="components-placeholder__illustration"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 60 60"
					>
						<Path
							vectorEffect="non-scaling-stroke"
							d="m61 32.622-13.555-9.137-15.888 9.859a5 5 0 0 1-5.386-.073l-9.095-5.989L1 37.5"
						/>
					</SVG>
				}
				{ content }
			</Placeholder>
		);
	};

	const onSelectImage = ( value ) => {
		if ( value?.id ) {
			setFeaturedImage( value.id );
		}
	};

	function onUploadError( message ) {
		noticeOperations.removeAllNotices();
		noticeOperations.createErrorNotice( message );
	}

	let image;
	if ( ! featuredImage && isDescendentOfQueryLoop ) {
		return <div { ...blockProps }>{ placeholderChip }</div>;
	}

	const label = __( 'Add a featured image' );

	if ( ! featuredImage ) {
		image = (
			<MediaPlaceholder
				onSelect={ onSelectImage }
				accept="image/*"
				allowedTypes={ ALLOWED_MEDIA_TYPES }
				onError={ onUploadError }
				placeholder={ placeholder }
				notices={ noticeUI }
				mediaLibraryButton={ ( { open } ) => {
					return (
						<Button
							icon={ upload }
							variant="primary"
							label={ label }
							showTooltip
							tooltipPosition="top center"
							onClick={ () => {
								open();
							} }
						/>
					);
				} }
			/>
		);
	} else {
		// We have a Featured image so show a Placeholder if is loading.
		image = ! media ? (
			placeholderChip
		) : (
			<img
				src={ media.source_url }
				alt={ media.alt_text || __( 'Featured image' ) }
				style={ { height, objectFit: height && scale } }
			/>
		);
	}

	return (
		<>
			<InspectorControls>
				<DimensionControls
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
				<PanelBody title={ __( 'Link settings' ) }>
					<ToggleControl
						label={ sprintf(
							// translators: %s: Name of the post type e.g: "post".
							__( 'Link to %s' ),
							postType
						) }
						onChange={ () => setAttributes( { isLink: ! isLink } ) }
						checked={ isLink }
					/>
				</PanelBody>
			</InspectorControls>
			{ !! media && ! isDescendentOfQueryLoop && (
				<BlockControls group="other">
					<MediaReplaceFlow
						mediaId={ featuredImage }
						mediaURL={ media.source_url }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						accept="image/*"
						onSelect={ onSelectImage }
						onError={ onUploadError }
					/>
				</BlockControls>
			) }
			<figure { ...blockProps }>{ image }</figure>
		</>
	);
}

const PostFeaturedImageWithNotices = withNotices( PostFeaturedImageDisplay );

export default function PostFeaturedImageEdit( props ) {
	const blockProps = useBlockProps();
	if ( ! props.context?.postId ) {
		return <div { ...blockProps }>{ placeholderChip }</div>;
	}
	return <PostFeaturedImageWithNotices { ...props } />;
}
