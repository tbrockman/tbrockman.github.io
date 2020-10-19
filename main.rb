require 'octokit'
require 'yaml'
require_relative 'lib/jekyll.rb'
require 'pathname'

def initialize_site
    site = Jekyll::Site.new(Jekyll.configuration(
        "show_drafts" => true
    ))
    # Probably necessary to initiaze site state
    site.reset
    site.read
    site.generate
    site
end

def process_site_documents(site, existing_issues, globs)
    payload = site.site_payload
    documents = []
    site.collections.each_value do |collection|

        collection.docs.each do |document|

            next if document.data.has_key?("title") && existing_issues.include?(document.data["title"])
            
            doc_path = Pathname.new document.path
            pwd = Pathname.new Dir.pwd
            relative = doc_path.relative_path_from pwd

            next if !globs.any?{ |glob| File.fnmatch(glob, relative) }

            # Copied logic straight from renderer.run
            # TODO:
            # If someone else knows Ruby and wants to determine which of the following steps aren't necessary
            # Feel free to eliminate any redundancy
    
            payload["page"] = document.to_liquid
            payload["paginator"] = (document.pager.to_liquid if document.respond_to?(:pager))
            payload["site"].current_document = document
            payload["highlighter_prefix"] = document.renderer.converters.first.highlighter_prefix
            payload["highlighter_suffix"] = document.renderer.converters.first.highlighter_suffix
            layout = document.renderer.layouts[document.data["layout"]]
            payload["layout"] = Jekyll::Utils.deep_merge_hashes(layout.data, payload["layout"] || {}) if layout
            info = {
                :registers        => { :site => site, :page => payload["page"] },
                :strict_filters   => site.config["liquid"]["strict_filters"],
                :strict_variables => site.config["liquid"]["strict_variables"],
            }
            output = document.content

            if document.render_with_liquid?
                Jekyll.logger.debug "Rendering Liquid:", document.relative_path
    
                # For any blog post, we need to render the document post-Liquid processing
                # So that all our assets will have been resolved appropriately
    
                document.content = document.renderer.render_liquid(output, payload, info, document.path)
            end

            documents.append(document)
        end
    end
    documents
end

# If github_token isn't available, no point doing any additional work

raise "ENV['github_token'] not defined." if not ENV.has_key?('github_token') # personal access token
raise "ENV['github_repo'] not defined" if not ENV.has_key?('github_repo') # ex. owner/repo_name

config = YAML.load_file('.github/social.yml')

raise "Unrecognized or missing renderer in .github/social.yml" if !config.has_key?('renderer') || config['renderer'] != 'jekyll'


client = Octokit::Client.new(:access_token => ENV['github_token'])
repo = ENV['github_repo']
existing_issues = Octokit.list_issues(repo).map(&:title).to_set
site = initialize_site

new_documents = process_site_documents(site, existing_issues, config["paths"])
new_documents.each do |document| 

    if config.has_key?('base_url')
        post_preview = ""

        if config['display'] == "content"
            matches = document.content.scan(/\[([^\[\]]*)\]\((.*?)\)/)
            
            next if matches.length.zero?
            
            matches.each do |match|
                # Now that we're done processing we can take the base URL
                # And use it to resolve any relative links!
                url = match[1]
                regex_absolute = url.match(/(?:^[a-z][a-z0-9+.-]*:|\/\/)/)

                if regex_absolute == nil
                    substitution = File.join(config["base_url"], url)
                    result = "[#{match[0]}](#{substitution})"
                    document.content.gsub!("[#{match[0]}](#{match[1]})", result)
                    post_preview = document.content
                end
            end
        end

        client.create_issue(repo, document.data['title'], post_preview)
    end
end